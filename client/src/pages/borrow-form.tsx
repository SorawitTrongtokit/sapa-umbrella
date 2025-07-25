import { useState } from 'react';
import { Umbrella as UmbrellaIcon, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useUserAuth } from '@/hooks/use-user-auth';
import { getLocationForUmbrella } from '@shared/schema';
import { useUmbrellaData } from '@/hooks/use-umbrella-data';
import { updateUmbrella, addActivity } from '@/lib/firebase';

export default function BorrowForm() {
  const { toast } = useToast();
  const { userProfile } = useUserAuth();
  const { getAvailableUmbrellas } = useUmbrellaData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedUmbrellaId, setSelectedUmbrellaId] = useState<number | null>(null);

  const availableUmbrellas = getAvailableUmbrellas();

  const handleUmbrellaSelect = (umbrellaId: number) => {
    setSelectedUmbrellaId(umbrellaId);
    setShowConfirmDialog(true);
  };

  const handleConfirmBorrow = async () => {
    if (!selectedUmbrellaId || !userProfile) return;
    
    setIsSubmitting(true);
    setShowConfirmDialog(false);
    
    try {
      const timestamp = Date.now();
      const location = getLocationForUmbrella(selectedUmbrellaId);
      const borrowerName = `${userProfile.firstName} ${userProfile.lastName}`;
      
      // Update umbrella status
      await updateUmbrella(selectedUmbrellaId, {
        id: selectedUmbrellaId,
        status: 'borrowed',
        currentLocation: location,
        borrower: {
          nickname: borrowerName,
          phone: userProfile.phone,
          timestamp
        },
        history: [] // Will be updated by Firebase triggers if needed
      });

      // Add activity log with user profile data
      await addActivity({
        type: 'borrow',
        umbrellaId: selectedUmbrellaId,
        nickname: borrowerName,
        location: location,
        timestamp,
        // Add additional user data for better tracking
        userInfo: {
          uid: userProfile.uid,
          email: userProfile.email,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          grade: userProfile.grade,
          studentNumber: userProfile.studentNumber,
          phone: userProfile.phone
        }
      });

      toast({
        title: "ยืมร่มเรียบร้อย",
        description: `ร่ม #${selectedUmbrellaId} ได้ถูกยืมแล้ว`,
        variant: "default"
      });

      setSelectedUmbrellaId(null);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถยืมร่มได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900 text-center">ยืมร่ม</h1>
          <p className="text-sm text-gray-600 text-center mt-1">Borrow Umbrella</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* User Info Card */}
        {userProfile && (
          <Card className="bg-blue-50 border-blue-200 mb-6">
            <CardContent className="p-4">
              <h3 className="font-medium text-blue-900 mb-2">ข้อมูลผู้ยืม</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <div>ชื่อ: {userProfile.firstName} {userProfile.lastName}</div>
                <div>ชั้น: {userProfile.grade} เลขที่: {userProfile.studentNumber}</div>
                <div>เบอร์โทร: {userProfile.phone}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Umbrellas */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">เลือกร่มที่ต้องการยืม</h3>
            
            {availableUmbrellas.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <UmbrellaIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>ไม่มีร่มที่พร้อมให้ยืมในขณะนี้</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableUmbrellas.map((umbrella) => (
                  <Card 
                    key={umbrella.id} 
                    className="border-2 border-gray-200 hover:border-blue-400 cursor-pointer transition-colors"
                    onClick={() => handleUmbrellaSelect(umbrella.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <UmbrellaIcon className="w-6 h-6 text-blue-600" />
                          <div>
                            <div className="font-medium">ร่ม #{umbrella.id}</div>
                            <div className="text-sm text-gray-600">{umbrella.currentLocation}</div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            พร้อมให้ยืม
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent className="max-w-md mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                ยืนยันการยืมร่ม
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="text-left space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">รายละเอียดการยืม:</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <div>• ชื่อ: <strong>{userProfile?.firstName} {userProfile?.lastName}</strong></div>
                      <div>• ร่มหมายเลข: <strong>#{selectedUmbrellaId}</strong></div>
                      <div>• ยืมจาก: <strong>{selectedUmbrellaId && getLocationForUmbrella(selectedUmbrellaId)}</strong></div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-orange-900">ข้อกำหนดสำคัญ:</div>
                        <div className="text-sm text-orange-800 mt-1">
                          <strong>ยืมจากที่ไหน ต้องคืนที่นั่น</strong><br/>
                          กรุณาคืนร่มที่ <strong>{selectedUmbrellaId && getLocationForUmbrella(selectedUmbrellaId)}</strong> เท่านั้น
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={() => setShowConfirmDialog(false)}
                disabled={isSubmitting}
              >
                ยกเลิก
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmBorrow}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UmbrellaIcon className="w-4 h-4 mr-2" />
                {isSubmitting ? 'กำลังยืม...' : 'ยืนยันการยืม'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
