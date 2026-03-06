pipeline {
    agent any

    environment {
        // Docker registry credentials (adjust to your registry)
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS = credentials('docker-hub-credentials')
        
        // Image tags
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/yourusername/easeshop-frontend:${BUILD_NUMBER}"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/yourusername/easeshop-backend:${BUILD_NUMBER}"
        
        // Database environment for tests (if needed)
        DB_HOST = 'localhost'
        DB_USER = 'root'
        DB_PASSWORD = 'rootpassword'
        DB_NAME = 'easeshop_test'
    }

    stages {
        stage('Checkout') {
            parallel {
                stage('Checkout Frontend') {
                    steps {
                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: '*/main']],
                            userRemoteConfigs: [[url: 'https://github.com/binishfaq/E-commerce-Website-Frontend.git']],
                            extensions: [[$class: 'RelativeTargetDirectory', relativeTargetDir: 'frontend']]
                        ])
                    }
                }
                stage('Checkout Backend') {
                    steps {
                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: '*/main']],
                            userRemoteConfigs: [[url: 'https://github.com/binishfaq/E-commerce-Website-Backend.git']],
                            extensions: [[$class: 'RelativeTargetDirectory', relativeTargetDir: 'backend']]
                        ])
                    }
                }
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            // Add your frontend test command here (if any)
                            // sh 'npm test'
                            echo 'No frontend tests configured.'
                        }
                    }
                }
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            // Add your backend test command here (if any)
                            // For example, use a test database
                            // sh 'npm test'
                            echo 'No backend tests configured.'
                        }
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Frontend Image') {
                    steps {
                        dir('frontend') {
                            sh """
                                docker build -t ${FRONTEND_IMAGE} .
                            """
                        }
                    }
                }
                stage('Build Backend Image') {
                    steps {
                        dir('backend') {
                            sh """
                                docker build -t ${BACKEND_IMAGE} .
                            """
                        }
                    }
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-hub-credentials') {
                        docker.image(FRONTEND_IMAGE).push()
                        docker.image(BACKEND_IMAGE).push()
                    }
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'  // Deploy only when building main branch
            }
            steps {
                // Add your deployment steps here (e.g., kubectl, ssh, docker-compose)
                echo "Deploying to production..."
                // Example using docker-compose on a remote server:
                // sh """
                //   scp docker-compose.prod.yml user@server:/opt/easeshop/
                //   ssh user@server "cd /opt/easeshop && docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d"
                // """
            }
        }
    }

    post {
        always {
            // Clean up Docker images to save space (optional)
            sh """
                docker rmi ${FRONTEND_IMAGE} || true
                docker rmi ${BACKEND_IMAGE} || true
            """
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}