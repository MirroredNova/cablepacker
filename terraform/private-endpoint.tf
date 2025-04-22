resource "azurerm_private_endpoint" "web_pe" {
  depends_on = [
    azurerm_linux_web_app.app
  ]
  name                = local.app_service_pe_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  subnet_id           = data.azurerm_subnet.subnet.id
  tags                = azurerm_resource_group.rg.tags

  ip_configuration {
    name               = local.pe_ip_config_name
    subresource_name   = "sites"
    private_ip_address = var.pe_static_ip
  }

  private_service_connection {
    name                           = local.app_service_private_connection_name
    is_manual_connection           = false
    private_connection_resource_id = azurerm_linux_web_app.app.id
    subresource_names              = ["sites"]
  }

  lifecycle {
    ignore_changes = [
      private_dns_zone_group
    ]
  }
}