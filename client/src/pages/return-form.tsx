import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Undo, MapPin, User, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { returnFormSchema, type ReturnForm, LOCATIONS } from '@shared/schema';
import { useUmbrellaData } from '@/hooks/use-umbrella-data';
import { updateUmbrella, addActivity } from '@/lib/firebase';

export default function ReturnForm() {
  const { toast } = useToast();
  const { getBorrowedUmbrellas, umbrellas } = useUmbrellaData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUmbrella, setSelectedUmbrella] = useState<any>(null);

  const form = useForm<ReturnForm>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: {
      umbrellaId: 0
      // ลบ returnLocation เพราะจะกำหนดอัตโนมัติ
    }
  });

  // Watch for umbrella selection changes
  const watchedUmbrellaId = form.watch('umbrellaId');
  
  useEffect(() => {
    if (watchedUmbrellaId && umbrellas[watchedUmbrellaId]) {
      const umbrella = umbrellas[watchedUmbrellaId];
      setSelectedUmbrella(umbrella);
      // ไม่ต้องมี setValue เพราะไม่มี returnLocation แล้ว
    } else {
      setSelectedUmbrella(null);
    }
  }, [watchedUmbrellaId, umbrellas]);

  const borrowedUmbrellas = getBorrowedUmbrellas();

  const onSubmit = async (data: ReturnForm) => {
    setIsSubmitting(true);
    
    try {
      const timestamp = Date.now();
      // คืนร่มที่ตำแหน่งเดิมเสมอ
      const returnLocation = selectedUmbrella?.currentLocation;
      
      if (!returnLocation || !selectedUmbrella) {
        throw new Error('ไม่พบข้อมูลร่มที่เลือก');
      }
      
      // Update umbrella status
      await updateUmbrella(data.umbrellaId, {
        id: data.umbrellaId,
        status: 'available',
        currentLocation: returnLocation,
        borrower: null,
        history: [] // Will be updated by Firebase triggers if needed
      });

      // Add activity log
      await addActivity({
        type: 'return',
        umbrellaId: data.umbrellaId,
        location: returnLocation,
        timestamp
      });

      toast({
        title: "คืนร่มเรียบร้อย! 🎉",
        description: `ร่ม #${data.umbrellaId} ได้ถูกคืนที่ ${returnLocation} แล้ว`,
        variant: "default"
      });

      form.reset();
      setSelectedUmbrella(null);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถคืนร่มได้ กรุณาลองใหม่อีกครั้ง",
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
          <p className="text-sm text-gray-600 text-center mt-1">กรุณาคืนร่มที่ตำแหน่งเดิม</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* คำแนะนำ */}
        {borrowedUmbrellas.length === 0 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              ขณะนี้ไม่มีร่มที่กำลังถูกยืม หรือคุณอาจต้องรอให้ข้อมูลอัพเดต
            </AlertDescription>
          </Alert>
        )}

        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="umbrellaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        หมายเลขร่มที่คืน <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger className="h-14 text-left">
                            <SelectValue placeholder="เลือกหมายเลขร่มที่คืน" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {borrowedUmbrellas.length > 0 ? (
                            borrowedUmbrellas.map((umbrella) => (
                              <SelectItem key={umbrella.id} value={umbrella.id.toString()}>
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="text-orange-700 border-orange-300">
                                    #{umbrella.id}
                                  </Badge>
                                  <span>
                                    {umbrella.borrower && `ยืมโดย: ${umbrella.borrower.nickname}`}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-umbrellas" disabled>
                              ไม่มีร่มที่กำลังถูกยืม
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ข้อมูลร่มที่เลือก */}
                {selectedUmbrella && (
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 p-5 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      ข้อมูลร่มที่เลือก
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <User className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600">ยืมโดย</p>
                          <p className="font-medium text-gray-900">{selectedUmbrella.borrower?.nickname}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600">ยืมเมื่อ</p>
                          <p className="font-medium text-gray-900">
                            {new Date(selectedUmbrella.borrower?.timestamp).toLocaleString('th-TH', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-orange-100 rounded-lg border-2 border-orange-300">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-5 h-5 text-orange-700" />
                          <p className="font-semibold text-orange-900">ต้องคืนที่</p>
                        </div>
                        <p className="text-lg font-bold text-orange-800">
                          📍 {selectedUmbrella.currentLocation}
                        </p>
                        <p className="text-sm text-orange-700 mt-1">
                          กรุณานำร่มไปคืนที่ตำแหน่งเดิมที่ยืมมา
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-lg font-medium"
                  disabled={isSubmitting || !selectedUmbrella}
                >
                  <Undo className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'กำลังดำเนินการ...' : 
                   selectedUmbrella ? `คืนร่ม #${selectedUmbrella.id}` : 'เลือกร่มที่จะคืน'}
                </Button>
                
                {selectedUmbrella && (
                  <p className="text-center text-sm text-gray-600">
                    💡 ระบบจะคืนร่มที่ <strong>{selectedUmbrella.currentLocation}</strong> อัตโนมัติ
                  </p>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
