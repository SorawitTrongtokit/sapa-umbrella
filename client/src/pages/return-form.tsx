import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Undo } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { returnFormSchema, type ReturnForm, LOCATIONS } from '@shared/schema';
import { useUmbrellaData } from '@/hooks/use-umbrella-data';
import { updateUmbrella, addActivity } from '@/lib/firebase';

export default function ReturnForm() {
  const { toast } = useToast();
  const { getBorrowedUmbrellas } = useUmbrellaData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReturnForm>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: {
      umbrellaId: 0,
      returnLocation: undefined
    }
  });

  const borrowedUmbrellas = getBorrowedUmbrellas();

  const onSubmit = async (data: ReturnForm) => {
    setIsSubmitting(true);
    
    try {
      const timestamp = Date.now();
      
      // Update umbrella status
      await updateUmbrella(data.umbrellaId, {
        id: data.umbrellaId,
        status: 'available',
        currentLocation: data.returnLocation,
        borrower: null,
        history: [] // Will be updated by Firebase triggers if needed
      });

      // Add activity log
      await addActivity({
        type: 'return',
        umbrellaId: data.umbrellaId,
        location: data.returnLocation,
        timestamp
      });

      toast({
        title: "คืนร่มเรียบร้อย",
        description: `ร่ม #${data.umbrellaId} ได้ถูกคืนแล้ว`,
        variant: "default"
      });

      form.reset();
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
          <p className="text-sm text-gray-600 text-center mt-1">Return Umbrella</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="umbrellaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>หมายเลขร่มที่คืน <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="เลือกหมายเลขร่มที่คืน" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {borrowedUmbrellas.map((umbrella) => (
                            <SelectItem key={umbrella.id} value={umbrella.id.toString()}>
                              ร่ม #{umbrella.id} {umbrella.borrower && `(ยืมโดย: ${umbrella.borrower.nickname})`}
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
                  name="returnLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ตำแหน่งที่คืน <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="เลือกตำแหน่งที่คืน" />
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
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
                  disabled={isSubmitting}
                >
                  <Undo className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'กำลังดำเนินการ...' : 'คืนร่ม'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
