from sqlalchemy import select


class DBService:

    @staticmethod
    def scalars_first(session, model, **filters):
        stmt = select(model).filter_by(**filters)
        return session.execute(stmt).scalars().first()

    @staticmethod
    def scalars_all(session, model, **filters):
        stmt = select(model).filter_by(**filters)
        return session.execute(stmt).scalars().all()
    
    @staticmethod
    def execute(session, stmt):
        return session.execute(stmt)
