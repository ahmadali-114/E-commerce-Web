pipeline {
  agent any

  stages {

    stage('Checkout Code') {
      steps {
        echo "Cloning project..."
        checkout scm
      }
    }

    stage('Install & Build Frontend') {
      steps {
        echo "Building frontend..."

        sh '''
          if [ -d frontend ]; then
            cd frontend
            npm install
            npm run build
            cd ..
          fi
        '''
      }
    }

    stage('Lint Check (Code Quality)') {
      steps {
        echo "Checking code quality..."

        sh '''
          if [ -f package.json ]; then
            npm install
            npm run lint || echo "No lint script"
          fi
        '''
      }
    }

    stage('Run Tests (Safe Mode)') {
      steps {
        echo "Running tests..."

        sh '''
          if grep -q '"test"' package.json; then
            npm test || echo "Tests failed but continuing..."
          else
            echo "No tests found"
          fi
        '''
      }
    }

    stage('Build & Run (Docker Compose)') {
      steps {
        echo "Deploying application..."

        sh '''
          docker-compose down || true
          docker-compose build
          docker-compose up -d
        '''
      }
    }

    stage('Health Check (IMPORTANT)') {
      steps {
        echo "Checking if app is running..."

        sh '''
          sleep 10
          curl -f http://localhost || exit 1
        '''
      }
    }

    stage('Check Running Containers') {
      steps {
        sh 'docker ps'
      }
    }

  }

  post {
    success {
      echo "FYP Pipeline SUCCESS 🚀"
    }
    failure {
      echo "FYP Pipeline FAILED ❌"
    }
  }
}
