from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.chat, name='chat'),
    path('stocks/', views.get_stocks, name='get_stocks'),
    path('stocks/<str:symbol>/chart/', views.get_stock_chart, name='get_stock_chart'),
    path('indices/', views.get_indices, name='get_indices'),
    path('stocks/<str:symbol>/details/', views.get_stock_details, name='get_stock_details'),
    path('mutual-funds/', views.get_mutual_funds, name='get_mutual_funds'),
    path('mutual-funds/invest/', views.save_investment, name='save_investment'),
    path('mutual-fund-details/<str:fund_id>/', views.get_mutual_fund_details, name='get_mutual_fund_details'),
    path('investments/', views.get_investments, name='get_investments'),

]