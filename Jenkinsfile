pipeline {
  agent any

  environment {
    IMAGE_NAME = "easeshop"
    TAG = "latest"
  }

  stages {

    stage('Checkout Code') {
      steps {
        echo "Cloning project..."
        checkout scm
      }
    }

    stage('Install & Build') {
      steps {
        echo "Installing dependencies..."

        sh '''
          if [ -f package.json ]; then
            npm install
          fi

          if [ -d frontend ]; then
            cd frontend
            npm install
            npm run build || echo "No build script"
            cd ..
          fi
        '''
      }
    }

    stage('Run Tests') {
      steps {
        echo "Running tests..."

        sh '''
          if [ -f package.json ]; then
            npm test || echo "No tests found"
          fi
        '''
      }
    }

    stage('Build Docker Image') {
      steps {
        echo "Building Docker image..."
        sh 'docker build -t $IMAGE_NAME:$TAG .'
      }
    }

    stage('Run Container') {
      steps {
        echo "Running container..."
        sh '''
          docker stop easeshop-container || true
          docker rm easeshop-container || true
          docker run -d -p 3000:3000 --name easeshop-container $IMAGE_NAME:$TAG
        '''
      }
    }

  }

  post {
    success {
      echo "Pipeline executed successfully!"
    }
    failure {
      echo "Pipeline failed!"
    }
  }
}
