import prisma from './config/database.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Check if users already exist (production-safe)
    const existingUsers = await prisma.user.findMany();
    if (existingUsers.length > 0) {
      console.log('✅ Database already seeded with', existingUsers.length, 'users. Skipping seed.');
      return;
    }

    console.log('🧹 No existing users found. Starting fresh seed...');

    // Create users
    const admin = await prisma.user.create({
      data: {
        name: 'Admin HR',
        email: 'admin@atomquest.com',
        password: await bcrypt.hash('demo123', 10),
        role: 'ADMIN',
        department: 'HR',
        avatar: 'AH'
      }
    });

    const managerSarah = await prisma.user.create({
      data: {
        name: 'Sarah Mitchell',
        email: 'sarah.mgr@atomquest.com',
        password: await bcrypt.hash('demo123', 10),
        role: 'MANAGER',
        department: 'Engineering',
        managerId: admin.id,
        avatar: 'SM'
      }
    });

    const managerMaya = await prisma.user.create({
      data: {
        name: 'Maya Sharma',
        email: 'maya.mgr@atomquest.com',
        password: await bcrypt.hash('demo123', 10),
        role: 'MANAGER',
        department: 'Sales',
        managerId: admin.id,
        avatar: 'MS'
      }
    });

    const employeeJohn = await prisma.user.create({
      data: {
        name: 'John Carter',
        email: 'john.emp@atomquest.com',
        password: await bcrypt.hash('demo123', 10),
        role: 'EMPLOYEE',
        department: 'Engineering',
        managerId: managerSarah.id,
        avatar: 'JC'
      }
    });

    const employeeJane = await prisma.user.create({
      data: {
        name: 'Jane Doe',
        email: 'jane.emp@atomquest.com',
        password: await bcrypt.hash('demo123', 10),
        role: 'EMPLOYEE',
        department: 'Engineering',
        managerId: managerSarah.id,
        avatar: 'JD'
      }
    });

    const employeeRaj = await prisma.user.create({
      data: {
        name: 'Raj Patel',
        email: 'raj.emp@atomquest.com',
        password: await bcrypt.hash('demo123', 10),
        role: 'EMPLOYEE',
        department: 'Sales',
        managerId: managerMaya.id,
        avatar: 'RP'
      }
    });

    console.log('👥 Created 6 users');

    // Create goal cycle
    const cycle = await prisma.goalCycle.create({
      data: {
        name: 'FY 2025–26',
        phase: 'Q2',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2026-03-31'),
        submissionDeadline: new Date('2025-05-01'),
        isActive: true
      }
    });

    console.log('📅 Created goal cycle');

    // Create John's goal sheet (approved)
    const johnSheet = await prisma.goalSheet.create({
      data: {
        employeeId: employeeJohn.id,
        employeeName: employeeJohn.name,
        department: employeeJohn.department,
        cycleId: cycle.id,
        status: 'LOCKED',
        submittedAt: new Date('2025-04-28T10:00:00Z'),
        approvedAt: new Date('2025-04-29T14:30:00Z'),
        approvedBy: managerSarah.name,
        version: 2
      }
    });

    // Create John's goals
    const goal1 = await prisma.goal.create({
      data: {
        sheetId: johnSheet.id,
        thrustArea: 'Product Quality',
        title: 'Reduce Bug Count',
        description: 'Reduce production bugs by implementing better code reviews and automated testing.',
        uomType: 'NUMERIC',
        targetValue: 50,
        weightage: 25,
        isShared: false,
        isReadonly: false
      }
    });

    const goal2 = await prisma.goal.create({
      data: {
        sheetId: johnSheet.id,
        thrustArea: 'Delivery',
        title: 'On-Time Sprint Delivery',
        description: 'Achieve 95%+ on-time delivery rate for all sprint commitments.',
        uomType: 'PERCENTAGE',
        targetValue: 95,
        weightage: 30,
        isShared: false,
        isReadonly: false
      }
    });

    const goal3 = await prisma.goal.create({
      data: {
        sheetId: johnSheet.id,
        thrustArea: 'Learning & Development',
        title: 'Complete Cloud Certification',
        description: 'Obtain AWS Solutions Architect certification by Q2.',
        uomType: 'TIMELINE',
        targetDate: new Date('2025-09-30'),
        weightage: 20,
        isShared: false,
        isReadonly: false
      }
    });

    const goal4 = await prisma.goal.create({
      data: {
        sheetId: johnSheet.id,
        thrustArea: 'Cost Management',
        title: 'Infrastructure Cost Reduction',
        description: 'Reduce cloud infrastructure costs through optimization.',
        uomType: 'NUMERIC',
        targetValue: 200000,
        weightage: 25,
        isShared: true,
        isReadonly: false
      }
    });

    // Create achievements for John's goals
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    for (const goal of [goal1, goal2, goal3, goal4]) {
      for (const quarter of quarters) {
        const isQ1 = quarter === 'Q1';
        const isQ2 = quarter === 'Q2';
        
        await prisma.achievement.create({
          data: {
            goalId: goal.id,
            quarter,
            actualValue: isQ1 ? (goal.id === goal1.id ? 38 : goal.id === goal2.id ? 92 : null) : 
                       isQ2 ? (goal.id === goal1.id ? 22 : goal.id === goal2.id ? 97 : null) : null,
            status: isQ1 ? 'ON_TRACK' : isQ2 ? (goal.id === goal3.id ? 'COMPLETED' : 'ON_TRACK') : 'NOT_STARTED',
            notes: isQ1 ? 'Improved test coverage significantly.' : isQ2 ? 'New linting rules added.' : null,
            submittedAt: isQ1 ? new Date('2025-07-15T09:00:00Z') : isQ2 ? new Date('2025-10-10T09:00:00Z') : null,
            isLocked: isQ1
          }
        });
      }
    }

    // Create comments for John's sheet
    await prisma.comment.create({
      data: {
        goalSheetId: johnSheet.id,
        authorId: managerSarah.id,
        authorName: managerSarah.name,
        content: 'Good goals! Adjusted the bug count target to 50 to be more realistic.',
        createdAt: new Date('2025-04-29T14:00:00Z')
      }
    });

    await prisma.comment.create({
      data: {
        goalSheetId: johnSheet.id,
        authorId: employeeJohn.id,
        authorName: employeeJohn.name,
        content: 'Understood, I will work towards it!',
        createdAt: new Date('2025-04-29T15:00:00Z')
      }
    });

    // Create Jane's goal sheet (submitted)
    const janeSheet = await prisma.goalSheet.create({
      data: {
        employeeId: employeeJane.id,
        employeeName: employeeJane.name,
        department: employeeJane.department,
        cycleId: cycle.id,
        status: 'SUBMITTED',
        submittedAt: new Date('2025-04-30T11:00:00Z'),
        version: 1
      }
    });

    const goal5 = await prisma.goal.create({
      data: {
        sheetId: janeSheet.id,
        thrustArea: 'Product Quality',
        title: 'Improve Test Coverage',
        description: 'Achieve 80%+ unit test coverage across all modules.',
        uomType: 'PERCENTAGE',
        targetValue: 80,
        weightage: 35,
        isShared: false,
        isReadonly: false
      }
    });

    const goal6 = await prisma.goal.create({
      data: {
        sheetId: janeSheet.id,
        thrustArea: 'Delivery',
        title: 'Feature Delivery Rate',
        description: 'Deliver all assigned features on schedule.',
        uomType: 'PERCENTAGE',
        targetValue: 90,
        weightage: 35,
        isShared: false,
        isReadonly: false
      }
    });

    const goal7 = await prisma.goal.create({
      data: {
        sheetId: janeSheet.id,
        thrustArea: 'Cost Management',
        title: 'Infrastructure Cost Reduction',
        description: 'Shared departmental cost reduction goal.',
        uomType: 'NUMERIC',
        targetValue: 200000,
        weightage: 30,
        isShared: true,
        isReadonly: true,
        parentGoalId: goal4.id
      }
    });

    // Create achievements for Jane's goals
    for (const goal of [goal5, goal6, goal7]) {
      for (const quarter of quarters) {
        await prisma.achievement.create({
          data: {
            goalId: goal.id,
            quarter,
            status: 'NOT_STARTED',
            isLocked: false
          }
        });
      }
    }

    // Create Raj's goal sheet (draft)
    const rajSheet = await prisma.goalSheet.create({
      data: {
        employeeId: employeeRaj.id,
        employeeName: employeeRaj.name,
        department: employeeRaj.department,
        cycleId: cycle.id,
        status: 'DRAFT',
        version: 1
      }
    });

    const goal8 = await prisma.goal.create({
      data: {
        sheetId: rajSheet.id,
        thrustArea: 'Revenue',
        title: 'Sales Revenue Target',
        description: 'Achieve quarterly sales revenue targets.',
        uomType: 'NUMERIC',
        targetValue: 5000000,
        weightage: 50,
        isShared: false,
        isReadonly: false
      }
    });

    const goal9 = await prisma.goal.create({
      data: {
        sheetId: rajSheet.id,
        thrustArea: 'Customer',
        title: 'New Customer Acquisition',
        description: 'Acquire 20 new enterprise clients.',
        uomType: 'NUMERIC',
        targetValue: 20,
        weightage: 50,
        isShared: false,
        isReadonly: false
      }
    });

    // Create achievements for Raj's goals
    for (const goal of [goal8, goal9]) {
      for (const quarter of quarters) {
        await prisma.achievement.create({
          data: {
            goalId: goal.id,
            quarter,
            status: 'NOT_STARTED',
            isLocked: false
          }
        });
      }
    }

    console.log('🎯 Created goal sheets and achievements');

    // Create audit logs
    await prisma.auditLog.create({
      data: {
        entityType: 'goal',
        entityId: goal1.id,
        actorId: managerSarah.id,
        actorName: managerSarah.name,
        action: 'update',
        fieldName: 'targetValue',
        oldValue: '60',
        newValue: '50',
        createdAt: new Date('2025-04-29T14:05:00Z')
      }
    });

    await prisma.auditLog.create({
      data: {
        entityType: 'goal_sheet',
        entityId: johnSheet.id,
        actorId: managerSarah.id,
        actorName: managerSarah.name,
        action: 'approve',
        createdAt: new Date('2025-04-29T14:30:00Z')
      }
    });

    await prisma.auditLog.create({
      data: {
        entityType: 'goal_sheet',
        entityId: johnSheet.id,
        actorId: employeeJohn.id,
        actorName: employeeJohn.name,
        action: 'submit',
        createdAt: new Date('2025-04-28T10:00:00Z')
      }
    });

    console.log('📋 Created audit logs');

    // Create notifications
    await prisma.notification.create({
      data: {
        userId: employeeJohn.id,
        type: 'approval',
        title: 'Goals Approved',
        message: 'Your goal sheet for FY 2025–26 has been approved by Sarah Mitchell.',
        isRead: false,
        createdAt: new Date('2025-04-29T14:30:00Z')
      }
    });

    await prisma.notification.create({
      data: {
        userId: managerSarah.id,
        type: 'submission',
        title: 'Goal Sheet Submitted',
        message: 'Jane Doe has submitted her goal sheet for FY 2025–26. Please review.',
        isRead: false,
        createdAt: new Date('2025-04-30T11:00:00Z')
      }
    });

    await prisma.notification.create({
      data: {
        userId: employeeJohn.id,
        type: 'reminder',
        title: 'Q2 Check-in Due',
        message: 'Q2 achievement check-in deadline is October 31. Please update your progress.',
        isRead: true,
        createdAt: new Date('2025-10-15T08:00:00Z')
      }
    });

    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'escalation',
        title: 'Escalation Alert',
        message: 'Raj Patel has not submitted goals for FY 2025–26. Deadline was May 1.',
        isRead: false,
        createdAt: new Date('2025-05-04T08:00:00Z')
      }
    });

    console.log('🔔 Created notifications');

    // Create escalations
    await prisma.escalation.create({
      data: {
        employeeName: employeeRaj.name,
        department: employeeRaj.department,
        type: 'not_submitted',
        level: 2,
        daysOverdue: 15,
        resolved: false,
        createdAt: new Date('2025-05-04T08:00:00Z')
      }
    });

    await prisma.escalation.create({
      data: {
        employeeName: 'Alex Kim',
        department: 'Marketing',
        type: 'approval_pending',
        level: 1,
        daysOverdue: 7,
        resolved: false,
        createdAt: new Date('2025-05-08T08:00:00Z')
      }
    });

    await prisma.escalation.create({
      data: {
        employeeName: 'Tom Brady',
        department: 'Finance',
        type: 'checkin_overdue',
        level: 3,
        daysOverdue: 21,
        resolved: false,
        createdAt: new Date('2025-10-25T08:00:00Z')
      }
    });

    console.log('⚠️ Created escalations');

    console.log('✅ Database seed completed successfully!');
    console.log('\n📝 Demo Credentials:');
    console.log('   Admin: admin@atomquest.com / demo123');
    console.log('   Manager: sarah.mgr@atomquest.com / demo123');
    console.log('   Employee: john.emp@atomquest.com / demo123');
    console.log('   Employee: jane.emp@atomquest.com / demo123');
    console.log('   Employee: raj.emp@atomquest.com / demo123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
