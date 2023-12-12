CREATE TABLE "formuser" (
    User_ID SERIAL PRIMARY KEY,
    User_Surname VARCHAR(50),
    User_First_Name VARCHAR(50),
    User_Nickname VARCHAR(50),
    User_Email VARCHAR(100) UNIQUE,
    User_Password VARCHAR(100),
    User_Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);