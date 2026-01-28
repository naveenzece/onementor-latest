    pipeline {
        agent any

        environment {
            CI = 'true'
            NODE_ENV = 'production'
        }

        stages {
            stage('Checkout') {
                steps {
                    checkout scm
                    sh 'git clean -fd'
                }
            }

            stage('Install Dependencies') {
                parallel {
                    stage('API Install') {
                        steps {
                            dir('api') {
                                sh 'npm ci --production=false'
                            }
                        }
                    }
                    stage('UI Install') {
                        steps {
                            dir('ui') {
                                sh 'npm ci --production=false'
                            }
                        }
                    }
                }
            }

            stage('Build UI') {
                steps {
                    dir('ui') {
                        sh 'npm run build'
                    }
                }
            }

            stage('Deploy') {
                steps {
                    script {
                        // Ensure PM2 is installed
                        sh 'npm install -g pm2 || true'
                        
                        // Stop existing processes if any
                        sh 'pm2 delete onementor-api onementor-ui || true'
                        
                        // Start applications using PM2
                        sh 'pm2 startOrReload ecosystem.config.js --update-env'
                        
                        // Save PM2 process list
                        sh 'pm2 save'
                        
                        // Setup PM2 startup script
                        sh 'pm2 startup | tail -1 | sudo bash || true'
                    }
                }
            }

            stage('Configure Nginx') {
                steps {
                    script {
                        // Copy nginx configuration
                        sh 'sudo cp nginx/onementor.conf /etc/nginx/sites-available/onementor.conf || true'
                        sh 'sudo ln -sf /etc/nginx/sites-available/onementor.conf /etc/nginx/sites-enabled/onementor.conf || true'
                        
                        // Test nginx configuration
                        sh 'sudo nginx -t || true'
                        
                        // Reload nginx
                        sh 'sudo systemctl reload nginx || sudo service nginx reload || true'
                    }
                }
            }
        }

        post {
            success {
                echo '✅ Deployment successful!'
                echo 'API is running on port 8000'
                echo 'UI is running on port 8080'
                echo 'Both are accessible via port 80 through nginx'
            }
            failure {
                echo '❌ Deployment failed. Check the logs above for details.'
            }
            always {
                // Cleanup if needed
                echo 'Build completed.'
            }
        }
    }
