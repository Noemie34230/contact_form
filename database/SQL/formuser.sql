CREATE TABLE "formuser" (
    user_ID SERIAL PRIMARY KEY,
    user_surname VARCHAR(50),
    user_firstname VARCHAR(50),
    user_email VARCHAR(100),
    user_confirmation VARCHAR(100),
    user_password VARCHAR(100),
    user_message VARCHAR(150)
);