import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Logo from "@/components/Logo";
import { 
  Users, 
  UserPlus, 
  ClipboardCheck, 
  DollarSign, 
  Cake, 
  CalendarCheck, 
  Award,
  ExternalLink,
  CalendarDays,
  Calendar,
  Link,
  X
} from "lucide-react";

const Dashboard: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const handleMetricClick = (metricTitle: string) => {
    setSelectedMetric(metricTitle);
    setShowDetailDialog(true);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Logo />
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline">This Week</Button>
          <Button>Today</Button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Employees"
          value="124"
          description="+4 from last month"
          icon={<Users className="h-5 w-5" />}
          colorClass="bg-blue-50 text-blue-700"
          onClick={() => handleMetricClick("Total Employees")}
        />
        <MetricCard 
          title="New Hires"
          value="8"
          description="This month"
          icon={<UserPlus className="h-5 w-5" />}
          colorClass="bg-green-50 text-green-700"
          onClick={() => handleMetricClick("New Hires")}
        />
        <MetricCard 
          title="Leave Approvals"
          value="6"
          description="Pending requests"
          icon={<ClipboardCheck className="h-5 w-5" />}
          colorClass="bg-orange-50 text-orange-700"
          onClick={() => handleMetricClick("Leave Approvals")}
        />
        <MetricCard 
          title="Reimbursements"
          value="12"
          description="Pending approvals"
          icon={<DollarSign className="h-5 w-5" />}
          colorClass="bg-purple-50 text-purple-700"
          onClick={() => handleMetricClick("Reimbursements")}
        />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Birthdays</CardTitle>
                <Cake className="h-5 w-5 text-pink-500" />
              </div>
              <CardDescription>Upcoming celebrations</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-4">
                  {birthdayData.map((person) => (
                    <div key={person.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={person.avatar} />
                        <AvatarFallback>{person.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{person.name}</p>
                        <p className="text-sm text-muted-foreground">{person.department}</p>
                      </div>
                      <Badge variant={person.days === 0 ? "default" : "outline"}>
                        {person.days === 0 ? "Today" : `In ${person.days} days`}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Holidays</CardTitle>
                <CalendarDays className="h-5 w-5 text-blue-500" />
              </div>
              <CardDescription>Upcoming holidays</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {holidayData.map((holiday) => (
                  <div key={holiday.id} className="flex items-center gap-3">
                    <div className="bg-blue-50 text-blue-700 p-2 rounded-md">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{holiday.name}</p>
                      <p className="text-sm text-muted-foreground">{holiday.date}</p>
                    </div>
                    <Badge variant="outline">{holiday.days} days</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 2 */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Approvals</CardTitle>
                <ClipboardCheck className="h-5 w-5 text-green-500" />
              </div>
              <CardDescription>Pending requests</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-4">
                  {approvalData.map((approval) => (
                    <div key={approval.id} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={approval.avatar} />
                          <AvatarFallback>{approval.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{approval.name}</p>
                            <Badge variant={approval.type === "Leave" ? "secondary" : "outline"} className={approval.type === "Leave" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : "bg-purple-100 text-purple-700 hover:bg-purple-100"}>
                              {approval.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{approval.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline">Reject</Button>
                        <Button size="sm">Approve</Button>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Quick Links</CardTitle>
                <Link className="h-5 w-5 text-indigo-500" />
              </div>
              <CardDescription>Frequently used resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {quickLinks.map((link) => (
                  <Button key={link.id} variant="outline" className="h-auto py-4 px-3 flex flex-col items-center justify-center gap-2 text-center">
                    <div className="bg-indigo-50 text-indigo-700 p-2 rounded-md">
                      {link.icon}
                    </div>
                    <span>{link.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 3 */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Work Anniversaries</CardTitle>
                <Award className="h-5 w-5 text-amber-500" />
              </div>
              <CardDescription>Celebrating milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-4">
                  {anniversaryData.map((person) => (
                    <div key={person.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={person.avatar} />
                        <AvatarFallback>{person.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{person.name}</p>
                          <Badge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                            {person.years} years
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{person.department}</p>
                      </div>
                      <Badge variant={person.days === 0 ? "default" : "outline"}>
                        {person.days === 0 ? "Today" : `In ${person.days} days`}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Department Status</CardTitle>
                <Users className="h-5 w-5 text-gray-500" />
              </div>
              <CardDescription>Employee distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentData.map((dept) => (
                  <div key={dept.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{dept.name}</p>
                      <span className="text-sm text-muted-foreground">{dept.count} employees</span>
                    </div>
                    <Progress value={dept.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMetric === "Total Employees" && <Users className="h-5 w-5 text-blue-700" />}
              {selectedMetric === "New Hires" && <UserPlus className="h-5 w-5 text-green-700" />}
              {selectedMetric === "Leave Approvals" && <ClipboardCheck className="h-5 w-5 text-orange-700" />}
              {selectedMetric === "Reimbursements" && <DollarSign className="h-5 w-5 text-purple-700" />}
              {selectedMetric}
            </DialogTitle>
            <DialogDescription>
              {selectedMetric === "Total Employees" && "Details about all employees in the organization"}
              {selectedMetric === "New Hires" && "Recent additions to the team"}
              {selectedMetric === "Leave Approvals" && "Pending leave requests that need your attention"}
              {selectedMetric === "Reimbursements" && "Expense reimbursements awaiting approval"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {selectedMetric === "Total Employees" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm text-blue-700 font-medium">Active</p>
                    <p className="text-2xl font-bold">118</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-md">
                    <p className="text-sm text-red-700 font-medium">On Leave</p>
                    <p className="text-2xl font-bold">6</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Department Distribution</p>
                  {departmentData.map((dept) => (
                    <div key={dept.id} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm">{dept.name}</p>
                        <span className="text-xs text-muted-foreground">{dept.count}</span>
                      </div>
                      <Progress value={dept.percentage} className="h-1" />
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {selectedMetric === "New Hires" && (
              <div className="space-y-3">
                {[
                  { name: "Alex Johnson", role: "Frontend Developer", joinDate: "May 2, 2024", avatar: "", initials: "AJ", department: "Engineering" },
                  { name: "Sarah Miller", role: "UX Designer", joinDate: "May 5, 2024", avatar: "", initials: "SM", department: "Design" },
                  { name: "Ryan Park", role: "Account Executive", joinDate: "May 10, 2024", avatar: "", initials: "RP", department: "Sales" },
                  { name: "Linda Chen", role: "HR Specialist", joinDate: "May 15, 2024", avatar: "", initials: "LC", department: "HR" }
                ].map((hire, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md">
                    <Avatar>
                      <AvatarImage src={hire.avatar} />
                      <AvatarFallback>{hire.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{hire.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">{hire.role}</p>
                        <Badge variant="outline" className="text-xs">{hire.department}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{hire.joinDate}</p>
                  </div>
                ))}
              </div>
            )}
            
            {selectedMetric === "Leave Approvals" && (
              <div className="space-y-3">
                {[
                  { name: "Ethan Williams", type: "Vacation", dates: "June 5-12, 2024", avatar: "", initials: "EW", urgent: false },
                  { name: "Olivia Davis", type: "Sick Leave", dates: "May 25, 2024", avatar: "", initials: "OD", urgent: true },
                  { name: "Noah Taylor", type: "Personal Leave", dates: "June 1-2, 2024", avatar: "", initials: "NT", urgent: false }
                ].map((leave, index) => (
                  <div key={index} className="space-y-2 border-b pb-2 last:border-0">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={leave.avatar} />
                        <AvatarFallback>{leave.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{leave.name}</p>
                          {leave.urgent && <Badge variant="destructive" className="text-xs">Urgent</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{leave.type}: {leave.dates}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline">Deny</Button>
                      <Button size="sm">Approve</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedMetric === "Reimbursements" && (
              <div className="space-y-3">
                {[
                  { name: "Michael Roberts", amount: "$350.75", category: "Travel", date: "May 18, 2024", avatar: "", initials: "MR" },
                  { name: "Emma Thompson", amount: "$128.45", category: "Office Supplies", date: "May 20, 2024", avatar: "", initials: "ET" },
                  { name: "James Wilson", amount: "$212.30", category: "Client Meeting", date: "May 21, 2024", avatar: "", initials: "JW" }
                ].map((expense, index) => (
                  <div key={index} className="space-y-2 border-b pb-2 last:border-0">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={expense.avatar} />
                        <AvatarFallback>{expense.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{expense.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{expense.amount}</p>
                          <Badge variant="outline" className="text-xs">{expense.category}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{expense.date}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline">Reject</Button>
                      <Button size="sm">Approve</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description, icon, colorClass, onClick }) => {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={`p-2 rounded-full ${colorClass}`}>
            {icon}
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl font-bold">{value}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Dummy data for birthdays
const birthdayData = [
  { id: 1, name: "Emma Thompson", department: "Marketing", days: 0, avatar: "", initials: "ET" },
  { id: 2, name: "James Wilson", department: "Engineering", days: 2, avatar: "", initials: "JW" },
  { id: 3, name: "Sophia Davis", department: "HR", days: 3, avatar: "", initials: "SD" },
  { id: 4, name: "Liam Johnson", department: "Sales", days: 5, avatar: "", initials: "LJ" },
  { id: 5, name: "Olivia Brown", department: "Design", days: 7, avatar: "", initials: "OB" }
];

// Dummy data for holidays
const holidayData = [
  { id: 1, name: "Memorial Day", date: "May 27, 2024", days: 14 },
  { id: 2, name: "Independence Day", date: "July 4, 2024", days: 45 },
  { id: 3, name: "Labor Day", date: "September 2, 2024", days: 105 }
];

// Dummy data for approvals
const approvalData = [
  { id: 1, name: "Michael Scott", type: "Leave", description: "Vacation: May 15-20", avatar: "", initials: "MS" },
  { id: 2, name: "Pam Beesly", type: "Reimbursement", description: "Office supplies: $128.45", avatar: "", initials: "PB" },
  { id: 3, name: "Jim Halpert", type: "Leave", description: "Sick leave: May 12", avatar: "", initials: "JH" },
  { id: 4, name: "Dwight Schrute", type: "Reimbursement", description: "Client meeting: $64.20", avatar: "", initials: "DS" }
];

// Dummy data for work anniversaries
const anniversaryData = [
  { id: 1, name: "David Wallace", department: "Executive", years: 8, days: 0, avatar: "", initials: "DW" },
  { id: 2, name: "Angela Martin", department: "Accounting", years: 5, days: 3, avatar: "", initials: "AM" },
  { id: 3, name: "Kevin Malone", department: "Accounting", years: 4, days: 7, avatar: "", initials: "KM" },
  { id: 4, name: "Oscar Martinez", department: "Accounting", years: 6, days: 12, avatar: "", initials: "OM" }
];

// Dummy data for departments
const departmentData = [
  { id: 1, name: "Engineering", count: 42, percentage: 35 },
  { id: 2, name: "Marketing", count: 18, percentage: 15 },
  { id: 3, name: "Sales", count: 24, percentage: 20 },
  { id: 4, name: "Human Resources", count: 12, percentage: 10 },
  { id: 5, name: "Design", count: 16, percentage: 13 },
  { id: 6, name: "Operations", count: 10, percentage: 7 }
];

// Dummy data for quick links
const quickLinks = [
  { id: 1, name: "Directory", icon: <Users className="h-5 w-5" /> },
  { id: 2, name: "Timesheet", icon: <CalendarCheck className="h-5 w-5" /> },
  { id: 3, name: "Payroll", icon: <DollarSign className="h-5 w-5" /> },
  { id: 4, name: "Documents", icon: <ExternalLink className="h-5 w-5" /> }
];

export default Dashboard;
