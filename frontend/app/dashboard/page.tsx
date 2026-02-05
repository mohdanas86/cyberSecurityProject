'use client';

import { AuthGuard } from '@/components/ui/AuthGuard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

function DashboardContent() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    const markdown = {
        data: `## Unifying Online and In-Store Retail Experiences

> *A Cloud-Based Project Using Microservices*

---

## 1. Project Overview

### **Project Title**

**Unifying Online and In-Store Retail Experiences Using Cloud Technologies**

### **Business Challenge**

Large retailers usually have:

* Physical (offline) stores
* Online (e-commerce) platforms

These systems often work **independently**, causing:

* Different prices online and offline
* Inconsistent promotions
* Incorrect inventory availability

This leads to **poor customer experience** and **loss of sales**.

---

## 2. Project Objective

* Integrate online and in-store retail systems
* Provide **real-time inventory visibility**
* Ensure **consistent pricing and promotions**
* Build a **scalable and reliable cloud architecture**
* Perform **data analytics and demand forecasting**

---

## 3. Technology Stack

| Technology                         | Purpose                                 |
| ---------------------------------- | --------------------------------------- |
| **Cloud CDN**                      | Fast delivery of static website content |
| **Google Kubernetes Engine (GKE)** | Run scalable microservices              |
| **Apigee**                         | API management and security             |
| **Cloud Spanner**                  | Real-time inventory database            |
| **BigQuery**                       | Analytics and forecasting               |

---`
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
                {user && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold">Welcome, {user.fullName}!</h2>
                        <p className="text-gray-600">Email: {user.email}</p>
                        <img
                            src={user.avatar}
                            alt="Avatar"
                            className="w-20 h-20 rounded-full mt-4"
                        />
                    </div>
                )}
                <Button onClick={handleLogout} variant="secondary">
                    Logout
                </Button>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <AuthGuard>
            <DashboardContent />
        </AuthGuard>
    );
}