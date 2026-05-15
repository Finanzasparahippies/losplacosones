#!/bin/bash

# Nectar Labs Base CLI
# Script to manage Nectar Labs projects

COMMAND=$1

show_help() {
    echo "Nectar Labs CLI"
    echo ""
    echo "Usage: ./nectar.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev          - Start development environment (Docker)"
    echo "  stop           - Stop all containers"
    echo "  restart        - Restart containers"
    echo "  logs           - Show real-time logs (Dev)"
    echo "  logs-prod      - Show real-time logs (Prod)"
    echo "  makemigrations - Generate new database migrations"
    echo "  migrate        - Run database migrations (Dev)"
    echo "  migrate-prod   - Run database migrations (Prod)"
    echo "  createsuperuser - Create a Django admin user"
    echo "  shell          - Open backend shell (Dev)"
    echo "  shell-prod     - Open backend shell (Prod)"
    echo "  frontend       - Run frontend locally (npm run dev)"
    echo "  build          - Build production images"
    echo "  up-prod        - Start production environment"
    echo "  down-prod      - Stop production environment"
    echo "  restart-prod   - Restart production environment"
    echo "  collectstatic  - Run collectstatic in backend (Prod)"
    echo "  certbot        - Request SSL certificate (Prod)"
    echo "  help           - Show this help"
}

case $COMMAND in
    dev)
        echo "Starting Nectar Labs Dev Environment..."
        docker compose up -d --build
        ;;
    stop)
        echo "Stopping containers..."
        docker compose down
        ;;
    up-prod)
        echo "Starting Nectar Labs Production Environment..."
        docker compose -f docker-compose.prod.yml up -d
        ;;
    down-prod)
        echo "Stopping Production Environment..."
        docker compose -f docker-compose.prod.yml down
        ;;
    restart)
        docker compose restart
        ;;
    logs)
        docker compose logs -f
        ;;
    logs-prod)
        echo "Showing Production Logs..."
        docker compose -f docker-compose.prod.yml logs -f
        ;;
    makemigrations)
        docker compose run --rm backend python manage.py makemigrations
        ;;
    migrate)
        docker compose exec backend python manage.py migrate
        ;;
    migrate-prod)
        echo "Running Production Migrations..."
        docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
        ;;
    collectstatic)
        echo "Running collectstatic..."
        docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --no-input
        ;;
    createsuperuser)
        docker compose exec backend python manage.py createsuperuser
        ;;
    shell)
        docker compose exec backend python manage.py shell
        ;;
    shell-prod)
        echo "Opening Production Backend Shell..."
        docker compose -f docker-compose.prod.yml exec backend python manage.py shell
        ;;
    frontend)
        cd frontend && npm run dev
        ;;
    build)
        docker compose -f docker-compose.prod.yml build
        ;;
    restart-prod)
        echo "Restarting Production Environment..."
        docker compose -f docker-compose.prod.yml restart
        ;;
    certbot)
        DOMAIN=$2
        if [ -z "$DOMAIN" ]; then
            echo "Usage: ./nectar.sh certbot example.com"
            exit 1
        fi
        docker compose -f docker-compose.prod.yml run --rm certbot certonly --webroot --webroot-path=/var/www/certbot -d $DOMAIN -d www.$DOMAIN
        ;;

    *)
        show_help
        ;;
esac
