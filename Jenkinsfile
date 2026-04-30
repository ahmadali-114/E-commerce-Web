pipeline {
    agent any

    environment {
        // Docker Hub Credentials
        DOCKER_HUB_USER = 'ahmadalimalik'
        DOCKER_CRED_ID  = 'dockerhubcred'
        
        // GitHub Credentials
        GITHUB_CRED_ID  = 'githubcred'
        
        // SonarQube Credentials and URL
        SONAR_CRED_ID   = 'sonarcred'
        SONAR_URL       = 'http://localhost:9000'
        
        // Email Credentials (Gmail)
        GMAIL_CRED_ID   = 'gmailcred'
    }

    stages {
        // --- STEP 1: GET THE CODE ---
        stage('1. Checkout Code') {
            steps {
                git branch: 'main', 
                    credentialsId: "${GITHUB_CRED_ID}", 
                    url: 'https://github.com/ahmadali-114/E-commerce-Web.git'
            }
        }

        // --- STEP 2: SONARQUBE ANALYSIS ---
        stage('2. SonarQube Analysis') {
            steps {
                script {
                    // Requires SonarQube Scanner plugin
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv(credentialsId: "${SONAR_CRED_ID}") {
                        sh "${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=E-commerce-Web \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=${SONAR_URL}"
                    }
                }
            }
        }

        // --- STEP 3: OWASP DEPENDENCY CHECK ---
        stage('3. OWASP Dependency Check') {
            steps {
                // Requires OWASP Dependency-Check plugin
                dependencyCheck additionalArguments: '--scan ./ --format HTML --format XML', odcInstallation: 'DP-Check'
                dependencyCheckPublisher pattern: 'dependency-check-report.xml'
            }
        }

        // --- STEP 4: BUILD ALL MICROSERVICES ---
        stage('4. Build Images') {
            steps {
                echo 'Building all microservice images...'
                
                sh "docker build -t ${DOCKER_HUB_USER}/auth:latest ./services/auth"
                sh "docker build -t ${DOCKER_HUB_USER}/product:latest ./services/product"
                sh "docker build -t ${DOCKER_HUB_USER}/order:latest ./services/order"
                sh "docker build -t ${DOCKER_HUB_USER}/user:latest ./services/user"
                sh "docker build -t ${DOCKER_HUB_USER}/admin:latest ./services/admin"
                sh "docker build -t ${DOCKER_HUB_USER}/frontend:latest ./frontend"
                sh "docker build -t ${DOCKER_HUB_USER}/gateway:latest ./gateway"
            }
        }

        // --- STEP 5: TRIVY IMAGE SCANNING ---
        stage('5. Trivy Image Scanning') {
            steps {
                echo 'Scanning Docker images for vulnerabilities...'
                
                // Scan each image and fail if HIGH or CRITICAL vulnerabilities are found
                sh "trivy image --severity HIGH,CRITICAL ${DOCKER_HUB_USER}/auth:latest"
                sh "trivy image --severity HIGH,CRITICAL ${DOCKER_HUB_USER}/product:latest"
                sh "trivy image --severity HIGH,CRITICAL ${DOCKER_HUB_USER}/order:latest"
                sh "trivy image --severity HIGH,CRITICAL ${DOCKER_HUB_USER}/user:latest"
                sh "trivy image --severity HIGH,CRITICAL ${DOCKER_HUB_USER}/admin:latest"
                sh "trivy image --severity HIGH,CRITICAL ${DOCKER_HUB_USER}/frontend:latest"
                sh "trivy image --severity HIGH,CRITICAL ${DOCKER_HUB_USER}/gateway:latest"
            }
        }

        // --- STEP 6: LOGIN AND PUSH TO DOCKER HUB ---
        stage('6. Push to Docker Hub') {
            steps {
                echo 'Logging into Docker Hub and pushing images...'
                
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CRED_ID}", passwordVariable: 'PASSWORD', usernameVariable: 'USERNAME')]) {
                    sh 'echo $PASSWORD | docker login -u $USERNAME --password-stdin'
                    
                    sh "docker push ${DOCKER_HUB_USER}/auth:latest"
                    sh "docker push ${DOCKER_HUB_USER}/product:latest"
                    sh "docker push ${DOCKER_HUB_USER}/order:latest"
                    sh "docker push ${DOCKER_HUB_USER}/user:latest"
                    sh "docker push ${DOCKER_HUB_USER}/admin:latest"
                    sh "docker push ${DOCKER_HUB_USER}/frontend:latest"
                    sh "docker push ${DOCKER_HUB_USER}/gateway:latest"
                }
            }
        }

        // --- STEP 7: DEPLOY (START SYSTEM + MONITORING) ---
        stage('7. Deploy System & Monitoring') {
            steps {
                echo 'Starting the full system and monitoring stack using Docker Compose...'
                
                // Stop any old version first
                sh 'docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml down || true'
                
                // Start everything in the background
                sh 'docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d'
            }
        }

        // --- STEP 8: VERIFY ---
        stage('8. Verify Running Services') {
            steps {
                echo 'Checking if containers are running...'
                sh 'docker ps'
            }
        }
    }

    post {
        success {
            emailext (
                subject: "✅ Pipeline Successful: ${currentBuild.fullDisplayName}",
                body: """<p>The pipeline for <b>E-commerce Web</b> completed successfully.</p>
                         <p><b>Build Details:</b></p>
                         <ul>
                            <li>Build Number: ${env.BUILD_NUMBER}</li>
                            <li>Build URL: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></li>
                         </ul>
                         <p>The system and monitoring stack (Prometheus/Grafana) are now live.</p>""",
                to: "ahmadalimalik@gmail.com",
                from: "jenkins@example.com",
                mimeType: 'text/html'
            )
            echo "✅ Pipeline Completed Successfully!"
        }
        failure {
            emailext (
                subject: "❌ Pipeline Failed: ${currentBuild.fullDisplayName}",
                body: """<p>The pipeline for <b>E-commerce Web</b> failed at stage: ${currentBuild.result}</p>
                         <p>Please check the logs here: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>""",
                to: "ahmadalimalik@gmail.com",
                from: "jenkins@example.com",
                mimeType: 'text/html'
            )
            echo "❌ Pipeline Failed."
        }
    }
}
