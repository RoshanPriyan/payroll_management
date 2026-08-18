backend/
│
├── venv/
│
├── __init__.py
├── main.py
├── database.py
├── global_utils.py
│
└── apis/
    │
    ├── __init__.py
    │
    ├── tenant/
    │   │
    │   ├── __init__.py
    │   ├── models.py
    │   ├── schemas.py
    │   ├── utils.py
    │   ├── routers.py
    │   │
    │   └── controllers/
    │       ├── __init__.py
    │       ├── create_tenant_api.py
    │       ├── update_tenant_api.py
    │       ├── delete_tenant_api.py
    │       ├── get_tenant_api.py
    │       └── list_tenants_api.py
    │
    └── business/
        │
        ├── __init__.py
        ├── models.py
        ├── schemas.py
        ├── utils.py
        ├── routers.py
        │
        └── controllers/
            ├── __init__.py
            ├── create_business_api.py
            ├── update_business_api.py
            ├── delete_business_api.py
            ├── get_business_api.py
            └── list_businesses_api.py