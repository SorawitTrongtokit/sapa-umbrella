import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Umbrella as UmbrellaIcon, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { borrowFormSchema, type BorrowForm, LOCATIONS } from '@shared/schema';
import { useUmbrellaData } from '@/hooks/use-umbrella-data';
import { updateUmbrella, addActivity } from '@/lib/firebase';

export default function BorrowForm() {
  const { toast } = useToast();
  const { getAvailableUmbrellas } = useUmbrellaData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<BorrowForm | null>(null);

  const form = useForm<BorrowForm>({
    resolver: zodResolver(borrowFormSchema),
    defaultValues: {
      nickname: '',
      phone: '',
      umbrellaId: 0,
      location: undefined
    }
  });

  const availableUmbrellas = getAvailableUmbrellas();

  const onSubmit = async (data: BorrowForm) => {
    // Show confirmation dialog instead of directly submitting
    setFormData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirmBorrow = async () => {
    if (!formData) return;
    
    setIsSubmitting(true);
    setShowConfirmDialog(false);
    
    try {
      const timestamp = Date.now();
      
      // Update umbrella status
      await updateUmbrella(formData.umbrellaId, {
        id: formData.umbrellaId,
        status: 'borrowed',
        currentLocation: formData.location,
        borrower: {
          nickname: formData.nickname,
          phone: formData.phone,
          timestamp
        },
        history: [] // Will be updated by Firebase triggers if needed
      });

      // Add activity log
      await addActivity({
        type: 'borrow',
        umbrellaId: formData.umbrellaId,
        nickname: formData.nickname,
        location: formData.location,
        timestamp
      });

      toast({
        title: "ยืมร่มเรียบร้อย",
        description: `ร่ม #${formData.umbrellaId} ได้ถูกยืมแล้ว`,
        variant: "default"
      });

      form.reset();
      setFormData(null);
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
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อเล่น <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="กรอกชื่อเล่น" 
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เบอร์โทร <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          type="tel"
                          placeholder="0123456789"
                          maxLength={10}
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="umbrellaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>หมายเลขร่ม <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="เลือกหมายเลขร่ม" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableUmbrellas.map((umbrella) => (
                            <SelectItem key={umbrella.id} value={umbrella.id.toString()}>
                              ร่ม #{umbrella.id} ({umbrella.currentLocation})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ตำแหน่งที่ยืม <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="เลือกตำแหน่ง" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(LOCATIONS).map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  <UmbrellaIcon className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืมร่ม'}
                </Button>
              </form>
            </Form>
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
                      <div>• ชื่อเล่น: <strong>{formData?.nickname}</strong></div>
                      <div>• ร่มหมายเลข: <strong>#{formData?.umbrellaId}</strong></div>
                      <div>• ยืมจาก: <strong>{formData?.location}</strong></div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-orange-900">ข้อกำหนดสำคัญ:</div>
                        <div className="text-sm text-orange-800 mt-1">
                          <strong>ยืมจากที่ไหน ต้องคืนที่นั่น</strong><br/>
                          กรุณาคืนร่มที่ <strong>{formData?.location}</strong> เท่านั้น
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
