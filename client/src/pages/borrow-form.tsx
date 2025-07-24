import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Umbrella as UmbrellaIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { borrowFormSchema, type BorrowForm, LOCATIONS } from '@shared/schema';
import { useUmbrellaData } from '@/hooks/use-umbrella-data';
import { updateUmbrella, addActivity } from '@/lib/firebase';

export default function BorrowForm() {
  const { toast } = useToast();
  const { getAvailableUmbrellas } = useUmbrellaData();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    
    try {
      const timestamp = Date.now();
      
      // Update umbrella status
      await updateUmbrella(data.umbrellaId, {
        id: data.umbrellaId,
        status: 'borrowed',
        currentLocation: data.location,
        borrower: {
          nickname: data.nickname,
          phone: data.phone,
          timestamp
        },
        history: [] // Will be updated by Firebase triggers if needed
      });

      // Add activity log
      await addActivity({
        type: 'borrow',
        umbrellaId: data.umbrellaId,
        nickname: data.nickname,
        location: data.location,
        timestamp
      });

      toast({
        title: "ยืมร่มเรียบร้อย",
        description: `ร่ม #${data.umbrellaId} ได้ถูกยืมแล้ว`,
        variant: "default"
      });

      form.reset();
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
      </div>
    </div>
  );
}
