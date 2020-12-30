

# Fetch availability zones in the current region.
data "aws_availability_zones" "available" {
  state = "available"
  exclude_names = [ "us-west-1a"]
}

resource "aws_vpc" "main" {
  cidr_block = var.cidr_block

  tags = merge(var.common_tags, {
    Name = "oce-ics-${var.environment}"
  })
}

locals {
  base_cidr              = aws_vpc.main.cidr_block
  cidr_block_public_ecs  = cidrsubnet(local.base_cidr, 4, 1)
  cidr_block_private_ecs = cidrsubnet(local.base_cidr, 4, 2)
  netnum_private_db      = cidrsubnet(local.base_cidr, 4, 3)
}

# Create private subnets for each availability zone.
resource "aws_subnet" "private" {
  count             = var.az_count
  cidr_block        = cidrsubnet(local.cidr_block_private_ecs, 4, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  vpc_id            = aws_vpc.main.id

  tags = merge(var.common_tags, {
    Name = "oce-ics-${var.environment} - Private ${count.index + 1}"
  })

}

# Create public subnets for each availability zone.
resource "aws_subnet" "public" {
  count                   = var.az_count
  cidr_block              = cidrsubnet(local.cidr_block_public_ecs, 4, count.index)

  availability_zone       = data.aws_availability_zones.available.names[count.index]
  vpc_id                  = aws_vpc.main.id
  map_public_ip_on_launch = true

  tags = merge(var.common_tags, {
    Name = "oce-ics-${var.environment} - Public ${count.index + 1}"
  })
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = merge(var.common_tags, {
    Name = "oce-ics-ig-${var.environment}"
  })
}

resource "aws_eip" "gw" {
  vpc        = true
  depends_on = [aws_internet_gateway.gw]

  tags = merge(var.common_tags, {
    Name = "oce-ics-eip-${var.environment}"
  })
}

resource "aws_nat_gateway" "gw" {
  subnet_id     = aws_subnet.public.0.id
  allocation_id = aws_eip.gw.id

  tags = merge(var.common_tags, {
    Name = "oce-ics-ng-${var.environment}"
  })
}

# Create a new route table for the private subnets.
# And make it route non-local traffic through the NAT gateway to the internet.
resource "aws_route_table" "private" {
  count  = var.az_count
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.gw.id
  }

  tags = merge(var.common_tags, {
    Name = "oce-ics-rt-${var.environment}-private-${count.index + 1}"
  })
}

# Explicitely associate the newly created route tables to the private subnets (so they don't default to the main route table).
resource "aws_route_table_association" "private" {
  count          = var.az_count
  subnet_id      = element(aws_subnet.private.*.id, count.index)
  route_table_id = element(aws_route_table.private.*.id, count.index)
}

resource "aws_route_table" "public" {
  count  = var.az_count
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = merge(var.common_tags, {
    Name = "oce-ics-rt-${var.environment}-public-${count.index + 1}"
  })
}

resource "aws_route_table_association" "public" {
  count          = var.az_count
  subnet_id      = element(aws_subnet.public.*.id, count.index)
  route_table_id = element(aws_route_table.public.*.id, count.index)
}


# Allow tcp connection from public to 25 port
resource "aws_security_group" "ecs_tasks" {
  name        = "ecs-tasks"
  description = "Allow inbound access from the public"
  vpc_id      = aws_vpc.main.id

  ingress {
    protocol        = "tcp"
    from_port       = "25"
    to_port         = "25"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

 tags = merge(var.common_tags, {
    Name = "oce-ics-sg-${var.environment}-private"
  })
}

# Allow access to the Redis. 
# Opening up the ElastiCache cluster to 0.0.0.0/0 does not expose the cluster to the Internet 
# because it has no public IP address and therefore cannot be accessed from outside the VPC.
resource "aws_security_group" "redis" {
  name        = "redis"
  description = "Allow inbound access from the public"
  vpc_id      = aws_vpc.main.id

  ingress {
    protocol        = "tcp"
    from_port       = "6379"
    to_port         = "6379"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

 tags = merge(var.common_tags, {
    Name = "oce-ics-sg-${var.environment}-private"
  })
}


# Mail Load Balancer
resource "aws_lb" "mail" {
  name            = "oce-ics-mail-nlb-${var.environment}"
  load_balancer_type = "network"

  subnets         = aws_subnet.public.*.id

  tags = merge(var.common_tags, {
    Name = "oce-ics-alb-${var.environment}"
  })
}

# Redirect all traffic from the load balancer to the target group.
# aws_alb_listener is known as aws_lb_listener. The functionality is identical.
resource "aws_alb_listener" "mail" {
  load_balancer_arn = aws_lb.mail.id
  port              = "25"
  protocol          = "TCP"


  default_action {
    target_group_arn = aws_lb_target_group.mail.id
    type             = "forward"
  }
}

resource "aws_lb_target_group" "mail" {
  name        = "oce-ics-mail-tg-${var.environment}"
  port        = 25
  protocol    = "TCP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  health_check {
    interval            = 30
    port                = 25
    healthy_threshold   = 3
    unhealthy_threshold = 3
    protocol            = "TCP"
  }
}