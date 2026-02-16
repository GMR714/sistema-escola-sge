from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI

api = NinjaAPI()

from academic.api import router as academic_router
from people.api import router as people_router
from diary.api import router as diary_router
from reports.api import router as reports_router
from pedagogical.api import router as pedagogical_router


api.add_router("/people", people_router)
api.add_router("/diary", diary_router)
api.add_router("/reports", reports_router)

api.add_router("/pedagogical", pedagogical_router)
from people.api_portal import router as portal_router
api.add_router("/portal", portal_router)

from transport.api import router as transport_router
from nutrition.api import router as nutrition_router
from hr.api import router as hr_router
from finance.api import router as finance_router

api.add_router("/transport", transport_router)
api.add_router("/nutrition", nutrition_router)
api.add_router("/hr", hr_router)
api.add_router("/finance", finance_router)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),
]
