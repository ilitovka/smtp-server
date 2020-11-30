module "vpc" {
    source = "../../modules/vpc"

    cidr_block = var.vpc_cidr_block
    environment = var.environment
    app = var.app
}

module "ecs" {
    source = "../../modules/ecs"

    ecr_image_url = var.aws_ecr_image_url

    ecs_security_group = module.vpc.ecs_tasks_security_group
    redis_security_group = module.vpc.redis_security_group


    private_subnets = module.vpc.private_subnets
    lb_target_group = module.vpc.lb_target_group-mail
    lb_listener = module.vpc.lb_listener-mail

    environment = var.environment
    app = var.app
    account_id = var.account_id
    region = var.region

    config_service_api_key = var.config_service_api_key
    config_service_url = var.config_service_url
    crypto_key = var.crypto_key
    crypto_algo = var.crypto_algo
    sf_api_endpoint = var.sf_api_endpoint
}

module "dns" {
    source = "../../modules/dns"

    domain_name_zone = var.domain_name_zone
    app_domain_name = var.app_domain_name
    lb-mail = module.vpc.lb-mail
    
    environment = var.environment
    region = var.region
    primary_region = var.primary_region

    dns_record_ttl = "60"
}


provider "aws" {
    region = var.region
}
