
resource "aws_ssm_parameter" "config_service_api_key" {
  name  = "/${local.app_name_space}/${var.environment}/CONFIG_SERVICE_API_KEY"
  type  = "SecureString"
  value = var.config_service_api_key
}

resource "aws_ssm_parameter" "config_service_url" {
  name  = "/${local.app_name_space}/${var.environment}/CONFIG_SERVICE_URL"
  type  = "String"
  value = var.config_service_url
}

resource "aws_ssm_parameter" "crypto_key" {
  name  = "/${local.app_name_space}/${var.environment}/CRYPTO_KEY"
  type  = "SecureString"
  value = var.crypto_key
}

resource "aws_ssm_parameter" "crypto_algo" {
  name  = "/${local.app_name_space}/${var.environment}/CRYPTO_ALGORITHM"
  type  = "String"
  value = var.crypto_algo
}

resource "aws_ssm_parameter" "sf_api_endpoint" {
  name  = "/${local.app_name_space}/${var.environment}/SFAPI_ENDPOINT"
  type  = "String"
  value = var.sf_api_endpoint
}


resource "aws_ssm_parameter" "redis_endpoint" {
  name  = "/${local.app_name_space}/${var.environment}/REDIS_ENDPOINT"
  type  = "String"
  value = aws_elasticache_cluster.redis.cache_nodes.0.address
}



