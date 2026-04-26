pipeline {
  agent any

  // Simple environment variables you can customize
  environment {
    // Docker image name (change to your registry/name)
    IMAGE_NAME = "easeshop"
    // Optional: registry host (leave empty to skip push stage)
    REGISTRY = ""
    // Jenkins credentials id for Docker registry (optional)
    DOCKER_CREDENTIALS_ID = "docker-credentials-id"
    // Developer email for failure notifications
    DEV_EMAIL = "example@email.com"
  }

  stages {

    stage('Clone (checkout)') {
      steps {
        // Clone code from the Git repository configured on the Jenkins job
        // For multibranch pipeline jobs, `checkout scm` will use the branch automatically
        echo "Checking out source code..."
        checkout scm
      }
    }

    stage('Build (install & frontend)') {
      steps {
        // Install dependencies and build the frontend (if present).
        // This is a simple, beginner-friendly approach — adjust per-service as needed.
        sh '''
          echo "Installing root deps if package.json exists..."
          if [ -f package.json ]; then
            npm ci || npm install
          fi

          # Build frontend (Vite) if frontend folder exists
          if [ -d frontend ]; then
            echo "Building frontend..."
            cd frontend
            npm ci || npm install
            npm run build || echo "No frontend build script defined"
            cd -
          fi
        '''
      }
    }

    stage('Test') {
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

    stage('Docker Build') {
      steps {
        // Build Docker image(s). Use docker-compose if present, otherwise a single docker build.
        script {
          // Set a simple tag: branch name if available, otherwise 'latest'
          env.APP_TAG = env.BRANCH_NAME ?: 'latest'
        }
        sh '''
          echo "Building Docker image(s)..."
          if [ -f docker-compose.yml ]; then
            docker-compose build --parallel
          else
            docker build -t ${IMAGE_NAME}:${APP_TAG} .
          fi
        '''
      }
    }

    stage('Push Docker Image (optional)') {
      // This stage only runs when you set REGISTRY to a non-empty value
      when {
        expression { return env.REGISTRY?.trim() }
      }
      steps {
        // Login and push image to registry. Requires `DOCKER_CREDENTIALS_ID` configured in Jenkins.
        script {
          withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
            sh '''
              echo "Logging in to registry ${REGISTRY}..."
              echo "$REG_PASS" | docker login ${REGISTRY} --username "$REG_USER" --password-stdin
              docker tag ${IMAGE_NAME}:${APP_TAG} ${REGISTRY}/${IMAGE_NAME}:${APP_TAG}
              docker push ${REGISTRY}/${IMAGE_NAME}:${APP_TAG}
            '''
          }
        }
      }
    }

    stage('Deploy (docker-compose)') {
      steps {
        // Deploy using docker-compose on the Jenkins agent/machine.
        // This assumes the agent has Docker and docker-compose installed and can reach any remote registry you use.
        sh '''
          echo "Deploying with docker-compose (if present)..."
          if [ -f docker-compose.yml ]; then
            # If you pushed images to a registry update the compose file or rely on docker-compose pull
            docker-compose pull || true
            docker-compose up -d --build
          else
            echo "No docker-compose.yml found in repo root. Update this step to deploy elsewhere."
          fi
        '''
      }
    }

  }

  post {
    failure {
      // Simple email notification on failure. Jenkins must be configured with an SMTP server.
      mail to: "${DEV_EMAIL}",
           subject: "Jenkins: Build failed in ${env.JOB_NAME} #${env.BUILD_NUMBER}",
           body: "Build failed.\nJob: ${env.JOB_NAME}\nBuild: ${env.BUILD_NUMBER}\nBranch: ${env.BRANCH_NAME}\nSee: ${env.BUILD_URL}"
    }
    always {
      echo "Pipeline finished. Clean-up steps could be added here."
    }
  }
}
