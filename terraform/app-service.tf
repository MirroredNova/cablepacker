resource "azurerm_service_plan" "asp" {
  depends_on = [
    azurerm_resource_group.rg
  ]
  resource_group_name = azurerm_resource_group.rg.name
  name                = local.asp_name
  os_type             = var.asp_os_type
  sku_name            = var.asp_sku
  location            = azurerm_resource_group.rg.location
  tags                = azurerm_resource_group.rg.tags
}

output "web_asp_id" {
  value       = azurerm_service_plan.asp.id
  description = "App service plan id"
}

output "web_asp_name" {
  value       = azurerm_service_plan.asp.name
  description = "App service plan name"
}
