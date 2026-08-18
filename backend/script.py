from passlib.context import CryptContext


super_admin_password = "super-admin123"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__truncate_error=True)

# print(pwd_context.hash(super_admin_password))
a = """
insert into platform_users(
    'first_name', 
    'last_name', 
    'email', 
    'password'
) 
values (
           'roshan', 
           'priyan', 
           'roshanpriyan@gmail.com',
           '$2b$12$dMsok12b6vMJERNUoDpl7OCouU1/MnX/rWTiQGKAHyblvFMBKwYdW'
       )
"""