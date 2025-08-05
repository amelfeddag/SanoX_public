import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SanoX Healthcare API',
      version: '1.0.0',
      description: `
        ## SanoX Healthcare Platform API
        
        A comprehensive healthcare platform connecting patients with doctors and providing AI-powered medical assistance.
        
        
      `,
    
      
    },
    servers: [
      {
        url: 'http://localhost:8081',
        description: 'Development server'
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            user_id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier'
            },
            firstName: {
              type: 'string',
              description: 'User\'s first name'
            },
            lastName: {
              type: 'string',
              description: 'User\'s last name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User\'s email address'
            },
            country: {
              type: 'string',
              description: 'User\'s country'
            },
            phoneNumber: {
              type: 'string',
              description: 'User\'s phone number'
            },
            profile_picture: {
              type: 'string',
              format: 'uri',
              description: 'URL to user\'s profile picture'
            },
            subscription_type: {
              type: 'string',
              enum: ['Basic', 'Premium'],
              description: 'User\'s subscription level'
            },
            isVerified: {
              type: 'boolean',
              description: 'Whether user\'s email is verified'
            },
            role: {
              type: 'string',
              enum: ['DOCTOR', 'PATIENT'],
              description: 'User\'s role in the system'
            },
            last_login: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp'
            }
          },
          example: {
            user_id: '550e8400-e29b-41d4-a716-446655440000',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            country: 'United States',
            phoneNumber: '+1234567890',
            subscription_type: 'Premium',
            isVerified: true,
            role: 'PATIENT'
          }
        },
        Doctor: {
          type: 'object',
          properties: {
            doctor_id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique doctor identifier'
            },
            first_name: {
              type: 'string',
              description: 'Doctor\'s first name'
            },
            last_name: {
              type: 'string',
              description: 'Doctor\'s last name'
            },
            specialty: {
              type: 'string',
              description: 'Doctor\'s medical specialty'
            },
            latitude: {
              type: 'number',
              format: 'float',
              description: 'Doctor\'s location latitude'
            },
            longitude: {
              type: 'number',
              format: 'float',
              description: 'Doctor\'s location longitude'
            }
          },
          example: {
            doctor_id: '550e8400-e29b-41d4-a716-446655440001',
            first_name: 'Dr. Sarah',
            last_name: 'Johnson',
            specialty: 'Cardiology',
            latitude: 40.7128,
            longitude: -74.0060
          }
        },
        Post: {
          type: 'object',
          properties: {
            post_id: {
              type: 'integer',
              description: 'Unique post identifier'
            },
            user_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the user who created the post'
            },
            post_title: {
              type: 'string',
              description: 'Post title'
            },
            post_content: {
              type: 'string',
              description: 'Post content/body'
            },
            post_type: {
              type: 'string',
              description: 'Type of post (question, experience, etc.)'
            },
            post_image: {
              type: 'string',
              format: 'uri',
              description: 'URL to post image if any'
            },
            is_active: {
              type: 'boolean',
              description: 'Whether post is active or archived'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Post creation timestamp'
            }
          }
        },
        ChatQuestion: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Question ID'
            },
            text: {
              type: 'string',
              description: 'Question text'
            },
            choices: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  text: { type: 'string' },
                  nextQuestionId: { type: 'integer', nullable: true }
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type'
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            statusCode: {
              type: 'integer',
              description: 'HTTP status code'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Unauthorized',
                message: 'Authentication invalid'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Validation Error',
                message: 'Email is required'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Not Found',
                message: 'User not found'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./Routes/*.js', './Controllers/*.js']
};

const specs = swaggerJSDoc(options);
export { specs, swaggerUi };