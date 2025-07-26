import { useState } from 'react';
import { Undo, MapPin, AlertCircle, Umbrella as UmbrellaIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useUserAuth } from '@/hooks/use-user-auth';
import { useUmbrellaData } from '@/hooks/use-umbrella-data';
import { updateUmbrella, addActivity } from '@/lib/firebase';

export default function ReturnForm() {
  const { toast } = useToast();
  const { user } = useUserAuth();
  const { getBorrowedUmbrellas } = useUmbrellaData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedUmbrella, setSelectedUmbrella] = useState<any>(null);

  // เอาเฉพาะร่มที่ผู้ใช้คนนี้ยืมไป
  const borrowedUmbrellas = user ? getBorrowedUmbrellas(user.uid) : [];

  const handleUmbrellaSelect = (umbrella: any) => {
    setSelectedUmbrella(umbrella);
    setShowConfirmDialog(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedUmbrella || !user) return;
    
    setIsSubmitting(true);
    setShowConfirmDialog(false);
    
    try {
      // ตรวจสอบว่าผู้ใช้สามารถคืนร่มนี้ได้หรือไม่
      if (selectedUmbrella.status !== 'borrowed') {
        throw new Error('ร่มนี้ไม่ได้ถูกยืม');
      }
      
      // ตรวจสอบว่าเป็นผู้ยืมหรือไม่
      if (selectedUmbrella.borrower?.uid !== user.uid) {
        throw new Error('คุณไม่สามารถคืนร่มนี้ได้ เพราะไม่ได้เป็นผู้ยืม');
      }
      
      const timestamp = Date.now();
      // คืนร่มที่ตำแหน่งเดิมเสมอ
      const returnLocation = selectedUmbrella.currentLocation;
      
      // Update umbrella status
      await updateUmbrella(selectedUmbrella.id, {
        id: selectedUmbrella.id,
        status: 'available',
        currentLocation: returnLocation,
        borrower: null,
        history: [] // Will be updated by Firebase triggers if needed
      });

      // Add activity log
      await addActivity({
        type: 'return',
        umbrellaId: selectedUmbrella.id,
        location: returnLocation,
        timestamp
      });

      toast({
        title: "คืนร่มเรียบร้อย! 🎉",
        description: `ร่ม #${selectedUmbrella.id} ได้ถูกคืนที่ ${returnLocation} แล้ว`,
        variant: "default"
      });

      setSelectedUmbrella(null);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถคืนร่มได้ กรุณาลองใหม่อีกครั้ง",
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
          <h1 className="text-xl font-semibold text-gray-900 text-center">คืนร่ม</h1>
          <p className="text-sm text-gray-600 text-center mt-1">Return Umbrella</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* คำแนะนำ */}
        {borrowedUmbrellas.length === 0 && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>ไม่มีร่มที่ต้องคืน</strong><br />
              คุณยังไม่ได้ยืมร่มใด ๆ หรือได้คืนร่มทั้งหมดแล้ว
            </AlertDescription>
          </Alert>
        )}

        {/* รายการร่มที่ยืม */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">เลือกร่มที่ต้องการคืน</h3>
            
            {borrowedUmbrellas.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <UmbrellaIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>ไม่มีร่มที่ต้องคืนในขณะนี้</p>
              </div>
            ) : (
              <div className="space-y-3">
                {borrowedUmbrellas.map((umbrella) => (
                  <Card 
                    key={umbrella.id} 
                    className="border-2 border-gray-200 hover:border-orange-400 cursor-pointer transition-colors"
                    onClick={() => handleUmbrellaSelect(umbrella)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <UmbrellaIcon className="w-6 h-6 text-orange-600" />
                          <div>
                            <div className="font-medium">ร่ม #{umbrella.id}</div>
                            <div className="text-sm text-gray-600">คืนที่: {umbrella.currentLocation}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              ยืมเมื่อ: {new Date(umbrella.borrower?.timestamp).toLocaleString('th-TH', {
                                day: '2-digit',
                                month: '2-digit',
                                year: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <Badge variant="outline" className="text-orange-700 border-orange-300">
                            กำลังยืม
                          </Badge>
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ยืนยันการคืนร่ม</AlertDialogTitle>
              <AlertDialogDescription>
                คุณต้องการคืนร่ม #{selectedUmbrella?.id} ที่ตำแหน่ง <strong>{selectedUmbrella?.currentLocation}</strong> ใช่หรือไม่?
                <br /><br />
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 mt-3">
                  <div className="flex items-center gap-2 text-orange-800">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">กรุณานำร่มไปคืนที่: {selectedUmbrella?.currentLocation}</span>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmReturn}
                disabled={isSubmitting}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSubmitting ? (
                  <>
                    <Undo className="w-4 h-4 mr-2 animate-spin" />
                    กำลังคืนร่ม...
                  </>
                ) : (
                  <>
                    <Undo className="w-4 h-4 mr-2" />
                    คืนร่ม
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
