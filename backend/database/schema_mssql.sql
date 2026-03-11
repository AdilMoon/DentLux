-- DentReserve Pro Database Schema
-- SQL Server

-- Drop existing objects if they exist (for re-running script)
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_expenses_updated_at') DROP TRIGGER trg_expenses_updated_at;
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_refunds_updated_at') DROP TRIGGER trg_refunds_updated_at;
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_payments_updated_at') DROP TRIGGER trg_payments_updated_at;
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_appointments_updated_at') DROP TRIGGER trg_appointments_updated_at;
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_services_updated_at') DROP TRIGGER trg_services_updated_at;
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_doctors_updated_at') DROP TRIGGER trg_doctors_updated_at;
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_users_updated_at') DROP TRIGGER trg_users_updated_at;
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[expenses]') AND type in (N'U')) DROP TABLE expenses;
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[refunds]') AND type in (N'U')) DROP TABLE refunds;
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[payments]') AND type in (N'U')) DROP TABLE payments;
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[appointments]') AND type in (N'U')) DROP TABLE appointments;
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[services]') AND type in (N'U')) DROP TABLE services;
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[doctors]') AND type in (N'U')) DROP TABLE doctors;
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U')) DROP TABLE users;
GO

-- Users table (accounts for authentication)
CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('CLIENT', 'DOCTOR', 'ADMIN')),
    full_name NVARCHAR(255) NOT NULL,
    phone NVARCHAR(50),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Doctors table (extended info for doctors)
CREATE TABLE doctors (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialization NVARCHAR(255),
    experience_years INT,
    work_schedule NVARCHAR(MAX), -- JSON stored as string, can add CHECK (ISJSON(work_schedule) = 1) for validation
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Services table (dental services)
CREATE TABLE services (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    duration_minutes INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Appointments table
-- Note: Changed doctor_id FK to NO ACTION to avoid cascade path conflicts
CREATE TABLE appointments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    client_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE NO ACTION,
    service_id UNIQUEIDENTIFIER NOT NULL REFERENCES services(id) ON DELETE NO ACTION,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ARRIVED', 'VISITED', 'MISSED', 'COMPLETED', 'DONE', 'CANCELLED')),
    notes NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Payments table
CREATE TABLE payments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    appointment_id UNIQUEIDENTIFIER UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'PAID' CHECK (status IN ('PAID', 'REFUNDED')),
    receipt_pdf_path NVARCHAR(500),
    payment_date DATETIME2 DEFAULT GETDATE(),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Refunds table
CREATE TABLE refunds (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    payment_id UNIQUEIDENTIFIER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    client_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    reason NVARCHAR(MAX),
    status NVARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    admin_notes NVARCHAR(MAX),
    processed_by UNIQUEIDENTIFIER REFERENCES users(id) ON DELETE SET NULL,
    processed_at DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Expenses table
CREATE TABLE expenses (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    category NVARCHAR(50) NOT NULL CHECK (category IN ('SALARY', 'EQUIPMENT', 'RENT', 'UTILITIES', 'SUPPLIES', 'OTHER')),
    amount DECIMAL(10, 2) NOT NULL,
    description NVARCHAR(MAX),
    expense_date DATE NOT NULL,
    created_by UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE NO ACTION,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Indexes for performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_appointments_client' AND object_id = OBJECT_ID('appointments'))
    CREATE INDEX idx_appointments_client ON appointments(client_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_appointments_doctor' AND object_id = OBJECT_ID('appointments'))
    CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_appointments_date' AND object_id = OBJECT_ID('appointments'))
    CREATE INDEX idx_appointments_date ON appointments(appointment_date, appointment_time);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_payments_appointment' AND object_id = OBJECT_ID('payments'))
    CREATE INDEX idx_payments_appointment ON payments(appointment_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_refunds_payment' AND object_id = OBJECT_ID('refunds'))
    CREATE INDEX idx_refunds_payment ON refunds(payment_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_refunds_client' AND object_id = OBJECT_ID('refunds'))
    CREATE INDEX idx_refunds_client ON refunds(client_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_expenses_date' AND object_id = OBJECT_ID('expenses'))
    CREATE INDEX idx_expenses_date ON expenses(expense_date);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_expenses_category' AND object_id = OBJECT_ID('expenses'))
    CREATE INDEX idx_expenses_category ON expenses(category);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_email' AND object_id = OBJECT_ID('users'))
    CREATE INDEX idx_users_email ON users(email);
GO

-- Trigger for updated_at
CREATE TRIGGER trg_users_updated_at
ON users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE u
    SET updated_at = GETDATE()
    FROM users u
    INNER JOIN inserted i ON u.id = i.id;
END;
GO

CREATE TRIGGER trg_doctors_updated_at
ON doctors
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE d
    SET updated_at = GETDATE()
    FROM doctors d
    INNER JOIN inserted i ON d.id = i.id;
END;
GO

CREATE TRIGGER trg_services_updated_at
ON services
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE s
    SET updated_at = GETDATE()
    FROM services s
    INNER JOIN inserted i ON s.id = i.id;
END;
GO

CREATE TRIGGER trg_appointments_updated_at
ON appointments
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE a
    SET updated_at = GETDATE()
    FROM appointments a
    INNER JOIN inserted i ON a.id = i.id;
END;
GO

CREATE TRIGGER trg_payments_updated_at
ON payments
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE p
    SET updated_at = GETDATE()
    FROM payments p
    INNER JOIN inserted i ON p.id = i.id;
END;
GO

CREATE TRIGGER trg_refunds_updated_at
ON refunds
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE r
    SET updated_at = GETDATE()
    FROM refunds r
    INNER JOIN inserted i ON r.id = i.id;
END;
GO

CREATE TRIGGER trg_expenses_updated_at
ON expenses
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE e
    SET updated_at = GETDATE()
    FROM expenses e
    INNER JOIN inserted i ON e.id = i.id;
END;
GO
