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
}

module "dns" {
    source = "../../modules/dns"

    domain_name_zone = var.domain_name_zone
    app_domain_name = var.app_domain_name
    lb-mail = module.vpc.lb-mail
    
    domain_name_hosted_zone = var.domain_name_hosted_zone
    application_domain_name = var.application_domain_name
    application_domain_name2 = var.application_domain_name2

    environment = var.environment
    region = var.region

    SLACK_CHANNEL = var.SLACK_CHANNEL
    SLACK_NOTIFICATION_URL = var.SLACK_NOTIFICATION_URL
    SLACK_USERNAME = var.SLACK_USERNAME
}

module "alert" {
    source = "../../modules/alert"

    app = var.app

    sns2slack_lambda_function_name = module.dns.sns2slack_lambda_function_name
    sns2slack_lambda_function_arn = module.dns.sns2slack_lambda_function_arn 
    ecs_autoscaler_threshold = module.ecs.ecs_autoscale_max_instances
    
    app_domain_name = var.app_domain_name

    environment = var.environment
    region = var.region

}

provider "aws" {
    region = var.region
}
