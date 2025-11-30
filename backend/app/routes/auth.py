from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.database import get_collection
from app.models.user_models import UserCreate, UserInDB, UserResponse, Token, TokenData
from app.utils.security import verify_password, get_password_hash, create_access_token, SECRET_KEY, ALGORITHM
from jose import JWTError, jwt


router = APIRouter(prefix="/api/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# --- DEPENDENCIES ---
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
        
    collection = get_collection("users")
    user = await collection.find_one({"username": token_data.username})
    if user is None:
        raise credentials_exception
    
    # Convert _id to string for Pydantic
    user["id"] = str(user["_id"])
    return UserResponse(**user)

async def get_current_admin(current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user

# --- ENDPOINTS ---

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    collection = get_collection("users")
    
    # Check if user exists
    existing_user = await collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create new user
    hashed_pw = get_password_hash(user.password)
    
    # Logic: First user ever created becomes Admin automatically
    count = await collection.count_documents({})
    role = "admin" if count == 0 else "player"
    
    user_db = UserInDB(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pw,
        role=role,
        points=0,
        stars=0
    )
    
    result = await collection.insert_one(user_db.dict(by_alias=True, exclude={"id"}))
    
    return UserResponse(
        id=str(result.inserted_id),
        username=user_db.username,
        email=user_db.email,
        role=user_db.role,
        points=0,
        stars=0
    )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    collection = get_collection("users")
    user = await collection.find_one({"username": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["username"], "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

# --- ADMIN ONLY ROUTES ---
@router.get("/admin/users", dependencies=[Depends(get_current_admin)])
async def get_all_users():
    collection = get_collection("users")
    users_cursor = collection.find({})
    users = await users_cursor.to_list(length=100)
    
    # Clean up _id for JSON response
    for user in users:
        user["id"] = str(user["_id"])
        del user["_id"]
        del user["hashed_password"] # Don't send hashes!
        
    return users