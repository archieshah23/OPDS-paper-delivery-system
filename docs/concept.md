Name: OPDS - Online Paper Delivery System
Purpose: Securely deliver question paper to authorized college dean and college admin.

Key Features:

- User authentication(Admin,Dean)
- OTP-based verification
- Document upload and download
- Encryption/decryption for security
- Role based access

| Object        | Context                       | Information                                                     |
| ------------- | ----------------------------- | --------------------------------------------------------------- |
| User          | Login, Role Assignment        | Name, Email, Role (Admin/Dean/Supervisor), Password (Encrypted) |
| OTP           | Email Verification for Access | Email, Generated OTP, Expiry Time                               |
| Document      | Upload/Download Pages         | File Name, File Type, Uploaded By, Timestamp                    |
| College       | Assigned to Dean              | College Name, MAC Address, Courses Offered                      |
| Course        | Displayed in College Context  | Course ID, Course Name, Assigned College                        |
| Session/Token | Session Management            | User ID, Token, Expiration Time                                 |
