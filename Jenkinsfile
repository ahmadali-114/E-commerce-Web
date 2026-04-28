pipeline {
  agent any

  stages {

    stage('Checkout Code') {
      steps {
        echo "Cloning project..."
        checkout scm
      }
    }

    stage('Build Frontend') {
      steps {
        echo "Building frontend..."

        sh '''
          if [ -d frontend ]; then
            cd frontend
            npm install
            npm run build
            cd ..
          else
            echo "No frontend folder found"
          fi
        '''
      }
    }

    stage('Run Tests (Safe)') {
      steps {
        // Run tests if a test script is defined. If no tests exist this will be a no-op.
        sh '''
          echo "Running tests if available..."
          if [ -f package.json ] && grep -q '"test"' package.json; then
            npm test || (echo "Tests failed" && exit 1)
          else
            echo "No root tests found. Add tests or customize this stage to run service tests."
          fi
        '''
      }
    }

    stage('Deploy with Docker Compose') {
      steps {
        echo "Deploying application using Docker Compose v2..."

        sh '''
          docker compose version

          docker compose down || true
          docker compose build
          docker compose up -d
        '''
      }
    }

    stage('Wait for Services') {
      steps {
        echo "Waiting for services to start..."
        sh 'sleep 15'
      }
    }

    stage('Health Check') {
      steps {
        echo "Checking application..."

        sh '''
          curl -f http://localhost || (echo "App not responding" && exit 1)
        '''
      }
    }

    stage('Show Running Containers') {
      steps {
        echo "Running containers:"
        sh 'docker ps'
      }
    }

  }

  post {
    success {
      echo "✅ FYP Pipeline SUCCESS - Application is running!"
    }
    failure {
      echo "❌ FYP Pipeline FAILED - Check logs"
    }
    always {
      echo "Pipeline execution completed."
    }
  }
}
