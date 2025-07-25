import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  RefreshCw, Download, AlertTriangle, Settings, 
  Database, Users, Shield, Bell, FileText,
  Trash2, RotateCcw, CheckCircle, XCircle
} from 'lucide-react';
import { updateUmbrella, addActivity, clearAllActivities } from '@/lib/firebase';

interface ManagementToolsProps {
  activities: any[];
  umbrellas: Record<number, any>;
}

export function ManagementTools({ activities, umbrellas }: ManagementToolsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // หาร่มที่มีปัญหา
  const problemUmbrellas = Object.values(umbrellas).filter((umbrella: any) => {
    const lastActivity = activities
      .filter(a => a.umbrellaId === umbrella.id)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    if (!lastActivity) return false;
    
    const hoursSinceActivity = (Date.now() - lastActivity.timestamp) / (1000 * 60 * 60);
    
    // ร่มที่ยืมมานานเกิน 24 ชั่วโมง
    return umbrella.status === 'borrowed' && hoursSinceActivity > 24;
  });

  // ร่มที่ไม่เคยถูกใช้
  const unusedUmbrellas = Object.values(umbrellas).filter((umbrella: any) => {
    const hasActivity = activities.some(a => a.umbrellaId === umbrella.id);
    return !hasActivity;
  });

  // สรุปข้อมูลการใช้งาน
  const systemHealth = {
    totalUmbrellas: 21,
    available: Object.values(umbrellas).filter((u: any) => u.status === 'available').length,
    borrowed: Object.values(umbrellas).filter((u: any) => u.status === 'borrowed').length,
    problems: problemUmbrellas.length,
    unused: unusedUmbrellas.length,
    totalActivities: activities.length
  };

  // ฟังก์ชันบังคับคืนร่มทั้งหมด
  const forceReturnAll = async () => {
    setIsLoading(true);
    try {
      const borrowedUmbrellas = Object.values(umbrellas).filter((u: any) => u.status === 'borrowed');
      
      for (const umbrella of borrowedUmbrellas) {
        await updateUmbrella(umbrella.id, {
          id: umbrella.id,
          status: 'available',
          currentLocation: umbrella.currentLocation,
          borrower: null,
          history: umbrella.history || []
        });

        await addActivity({
          type: 'admin_update',
          umbrellaId: umbrella.id,
          location: umbrella.currentLocation,
          timestamp: Date.now(),
          note: 'Admin force return all umbrellas'
        });
      }

      toast({
        title: "บังคับคืนร่มทั้งหมดสำเร็จ",
        description: `คืนร่ม ${borrowedUmbrellas.length} คัน`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบังคับคืนร่มได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันรีเซ็ตระบบ
  const resetSystem = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะรีเซ็ตระบบ? การกระทำนี้จะลบ Activity ทั้งหมด!')) {
      return;
    }

    setIsLoading(true);
    try {
      // รีเซ็ตร่มทั้งหมดให้เป็น available
      for (let i = 1; i <= 21; i++) {
        let defaultLocation;
        if (i >= 1 && i <= 7) defaultLocation = "ใต้โดม";
        else if (i >= 8 && i <= 14) defaultLocation = "ศูนย์กีฬา";
        else defaultLocation = "โรงอาหาร";

        await updateUmbrella(i, {
          id: i,
          status: 'available',
          currentLocation: defaultLocation,
          borrower: null,
          history: []
        });
      }

      await addActivity({
        type: 'admin_update',
        umbrellaId: 0,
        location: 'ใต้โดม',
        timestamp: Date.now(),
        note: 'System reset by admin'
      });

      toast({
        title: "รีเซ็ตระบบสำเร็จ",
        description: "ร่มทั้งหมดถูกรีเซ็ตเป็นสถานะว่าง",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถรีเซ็ตระบบได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันลบ Activity ทั้งหมด
  const clearActivities = async () => {
    const result = confirm(
      '🗑️ ลบ Activity ทั้งหมด\n\n' +
      `คุณกำลังจะลบประวัติกิจกรรมทั้งหมด ${activities.length} รายการ\n\n` +
      '⚠️ การกระทำนี้ไม่สามารถยกเลิกได้!\n' +
      '- ประวัติการยืม-คืนจะหายไปทั้งหมด\n' +
      '- ข้อมูลสถิติจะถูกรีเซ็ต\n' +
      '- ร่มจะยังคงสถานะปัจจุบัน\n\n' +
      'ยืนยันการลบ?'
    );

    if (!result) return;

    setIsLoading(true);
    try {
      await clearAllActivities();

      toast({
        title: "ลบ Activity สำเร็จ ✅",
        description: `ลบประวัติกิจกรรมทั้งหมด ${activities.length} รายการแล้ว`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด ❌",
        description: "ไม่สามารถลบ Activity ได้ กรุณาลองใหม่",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันส่งออกข้อมูล
  const exportData = () => {
    const exportData = {
      umbrellas: Object.values(umbrellas),
      activities: activities,
      exportTime: new Date().toISOString(),
      systemHealth
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `umbrella-system-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "ส่งออกข้อมูลสำเร็จ",
      description: "ไฟล์ข้อมูลถูกดาวน์โหลดแล้ว",
      variant: "default"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">🛠️ Management Tools</h2>
      </div>

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            สถานะระบบ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{systemHealth.available}</div>
              <div className="text-sm text-green-800">ร่มว่าง</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{systemHealth.borrowed}</div>
              <div className="text-sm text-orange-800">ร่มถูกยืม</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{systemHealth.problems}</div>
              <div className="text-sm text-red-800">ร่มมีปัญหา</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{systemHealth.unused}</div>
              <div className="text-sm text-gray-800">ไม่เคยใช้</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{systemHealth.totalActivities}</div>
              <div className="text-sm text-blue-800">กิจกรรมทั้งหมด</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((systemHealth.available / systemHealth.totalUmbrellas) * 100)}%
              </div>
              <div className="text-sm text-purple-800">อัตราว่าง</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management Actions */}
      <Tabs defaultValue="actions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="actions">การจัดการ</TabsTrigger>
          <TabsTrigger value="problems">ปัญหา</TabsTrigger>
          <TabsTrigger value="data">ข้อมูล</TabsTrigger>
        </TabsList>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">การจัดการร่ม</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={forceReturnAll}
                  disabled={isLoading || systemHealth.borrowed === 0}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  บังคับคืนร่มทั้งหมด ({systemHealth.borrowed} คัน)
                </Button>

                <Button
                  onClick={resetSystem}
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  รีเซ็ตระบบทั้งหมด
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">การจัดการข้อมูล</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={exportData}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  ส่งออกข้อมูลทั้งหมด
                </Button>

                <Button
                  onClick={clearActivities}
                  disabled={isLoading || activities.length === 0}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700 relative"
                  title="ลบประวัติกิจกรรมทั้งหมด (ไม่ส่งผลต่อสถานะร่ม)"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  ลบ Activity ทั้งหมด 
                  {activities.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-white text-red-600">
                      {activities.length}
                    </Badge>
                  )}
                </Button>

                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  รีเฟรชข้อมูล
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Problems Tab */}
        <TabsContent value="problems" className="space-y-4">
          {problemUmbrellas.length > 0 ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                พบร่ม {problemUmbrellas.length} คันที่ยืมมานานเกิน 24 ชั่วโมง
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ไม่พบปัญหาร่มที่ยืมค้างนาน ระบบทำงานปกติ
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4">
            {problemUmbrellas.map((umbrella: any) => {
              const lastActivity = activities
                .filter(a => a.umbrellaId === umbrella.id)
                .sort((a, b) => b.timestamp - a.timestamp)[0];
              
              const hoursSince = Math.floor((Date.now() - lastActivity.timestamp) / (1000 * 60 * 60));

              return (
                <Card key={umbrella.id} className="border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-red-800">ร่ม #{umbrella.id}</h3>
                        <p className="text-sm text-red-600">
                          ยืมโดย: {umbrella.borrower?.nickname} | {hoursSince} ชั่วโมงที่แล้ว
                        </p>
                        <p className="text-xs text-gray-600">
                          ตำแหน่ง: {umbrella.currentLocation}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="destructive">ค้างนาน</Badge>
                        <Button
                          size="sm"
                          onClick={async () => {
                            setIsLoading(true);
                            try {
                              await updateUmbrella(umbrella.id, {
                                ...umbrella,
                                status: 'available',
                                borrower: null
                              });
                              
                              await addActivity({
                                type: 'admin_update',
                                umbrellaId: umbrella.id,
                                location: umbrella.currentLocation,
                                timestamp: Date.now(),
                                note: `Force return overdue umbrella (${hoursSince} hours)`
                              });

                              toast({
                                title: "บังคับคืนสำเร็จ",
                                description: `ร่ม #${umbrella.id} ถูกบังคับคืนแล้ว`,
                                variant: "default"
                              });
                            } catch (error) {
                              toast({
                                title: "เกิดข้อผิดพลาด",
                                variant: "destructive"
                              });
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          disabled={isLoading}
                        >
                          บังคับคืน
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {unusedUmbrellas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-600">ร่มที่ไม่เคยถูกใช้</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {unusedUmbrellas.map((umbrella: any) => (
                    <Badge key={umbrella.id} variant="outline" className="text-gray-600">
                      #{umbrella.id} ({umbrella.currentLocation})
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  ร่มเหล่านี้อาจต้องการตรวจสอบสภาพหรือย้ายตำแหน่ง
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  ข้อมูลระบบ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Firebase Database:</span>
                  <Badge variant="outline" className="text-green-600">Online</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Total Records:</span>
                  <span>{Object.keys(umbrellas).length + activities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Activity Records:</span>
                  <span className="font-bold">{activities.length} รายการ</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Activity:</span>
                  <span>
                    {activities.length > 0 
                      ? new Date(activities[0].timestamp).toLocaleString('th-TH')
                      : 'ไม่มี'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  การจัดการข้อมูล
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert className="p-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>หมายเหตุการลบ Activity:</strong><br/>
                    • ลบเฉพาะประวัติกิจกรรม<br/>
                    • ไม่ส่งผลต่อสถานะร่มปัจจุบัน<br/>
                    • ใช้สำหรับทดสอบระบบ
                  </AlertDescription>
                </Alert>
                
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>การยืม:</span>
                    <span>{activities.filter(a => a.type === 'borrow').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>การคืน:</span>
                    <span>{activities.filter(a => a.type === 'return').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admin Actions:</span>
                    <span>{activities.filter(a => a.type === 'admin_update').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
