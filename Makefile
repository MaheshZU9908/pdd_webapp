# PathoAI — Root Orchestration Makefile

.PHONY: help backend web mobile test-web test-mobile test-all

help:
	@echo "PathoAI Monorepo Commands:"
	@echo "  make backend     - Run backend FastAPI server"
	@echo "  make web         - Run web frontend dev server"
	@echo "  make mobile      - Run Flutter mobile app"
	@echo "  make build-apk   - Build Android debug APK"
	@echo "  make test-web    - Run web Selenium E2E tests"
	@echo "  make test-mobile - Run mobile Appium E2E tests"
	@echo "  make test-all    - Run web and mobile test suites"

backend:
	cd backend && uvicorn app:app --host 127.0.0.1 --port 8000 --reload

web:
	cd pathoai-web && npm start

mobile:
	cd ../PathoAI-Mobile/flutter && flutter run

build-apk:
	cd ../PathoAI-Mobile/flutter && flutter build apk --debug

test-web:
	cd pathoai-web && python -m pytest tests/e2e/test_web.py -v

test-mobile:
	cd ../PathoAI-Mobile && python -m pytest tests/e2e/test_cases.py -v

test-all: test-web test-mobile
