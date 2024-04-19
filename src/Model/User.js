class User {
  constructor(email, password, name, role, gdpr, createdAt, isActive) {
    this.email = email;
    this.password = password;
    this.name = name;
    this.role = role;
    this.gdpr = gdpr;
    this.createdAt = createdAt;
    this.isActive = isActive;
  }
}

module.exports = { User };
