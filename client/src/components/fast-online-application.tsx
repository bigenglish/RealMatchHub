import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CheckCircle, Upload, FileText, AlertCircle, Clock, ArrowRight } from 'lucide-react';

// Define the validation schema for the form
const applicationFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  income: z.string().min(1, "Annual income is required"),
  employmentStatus: z.enum(["employed", "self-employed", "retired", "unemployed"]),
  creditScore: z.enum(["excellent", "good", "fair", "poor", "unknown"]),
});

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

// Define document types
const documentTypes = [
  { id: 'paystub', label: 'Pay Stub', description: 'Recent pay stubs from your employer' },
  { id: 'bank_statement', label: 'Bank Statement', description: 'Recent bank statements showing income deposits' },
  { id: 'tax_return', label: 'Tax Return', description: 'Most recent tax return (1040 form)' },
  { id: 'w2', label: 'W-2 Form', description: 'W-2 form from your employer' }
];

export function FastOnlineApplication() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('application');
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [documentUploads, setDocumentUploads] = useState<Record<string, any>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Set up the form
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      income: '',
      employmentStatus: 'employed',
      creditScore: 'unknown',
    },
  });

  // Submit the application form
  const onSubmit = (data: ApplicationFormValues) => {
    console.log("Application submitted:", data);
    
    toast({
      title: "Application Submitted",
      description: "Please continue to document upload to complete your pre-approval process.",
    });
    
    setApplicationSubmitted(true);
    setActiveTab('documents');
  };

  // Handle document upload
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Create a progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 100);
      
      // Create form data
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);
      
      // Send to API
      const response = await fetch('/api/documents/process', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!response.ok) {
        throw new Error('Failed to process document');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setDocumentUploads(prev => ({
          ...prev,
          [documentType]: {
            file: file.name,
            status: 'success',
            data: result.data
          }
        }));
        
        toast({
          title: "Document Processed",
          description: `Your ${getDocumentLabel(documentType)} was successfully processed.`,
        });
      } else {
        setDocumentUploads(prev => ({
          ...prev,
          [documentType]: {
            file: file.name,
            status: 'error',
            error: result.error
          }
        }));
        
        toast({
          title: "Processing Failed",
          description: result.error || 'Failed to process document',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Document upload error:', error);
      
      setDocumentUploads(prev => ({
        ...prev,
        [documentType]: {
          file: file.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
      
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Get document label from ID
  const getDocumentLabel = (documentId: string): string => {
    const document = documentTypes.find(doc => doc.id === documentId);
    return document ? document.label : documentId;
  };

  // Check if all required documents are uploaded
  const allDocumentsUploaded = () => {
    // Require at least paystub and bank_statement
    return documentUploads['paystub']?.status === 'success' && 
           documentUploads['bank_statement']?.status === 'success';
  };

  // Submit the complete application with documents
  const submitCompleteApplication = () => {
    toast({
      title: "Application Completed",
      description: "Your application has been submitted for review. We'll contact you soon.",
    });
    
    // Here you would typically send the complete application to your backend
    console.log("Complete application submitted:", {
      personalInfo: form.getValues(),
      documents: documentUploads
    });
    
    // Navigate to a confirmation page or show confirmation UI
    setActiveTab('confirmation');
  };

  // Render document card with upload status
  const renderDocumentCard = (documentType: string, label: string, description: string) => {
    const uploadStatus = documentUploads[documentType]?.status;
    
    // Document type specific information
    const getDocumentInfo = () => {
      switch(documentType) {
        case 'paystub':
          return {
            icon: <FileText className="h-10 w-10 p-2 bg-blue-100 text-blue-600 rounded-full" />,
            fields: ['Employer Name', 'Employee Name', 'Pay Period', 'Gross Pay', 'Net Pay'],
            examples: 'Examples: Regular paycheck stub, Direct deposit receipt',
            tips: 'Make sure the stub shows your full name, employer name, and pay amount clearly.'
          };
        case 'bank_statement':
          return {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 p-2 bg-green-100 text-green-600 rounded-full" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" /><path d="M10 2v4" /><path d="M14 2v4" /><path d="M10 22v-4" /><path d="M14 22v-4" /><path d="M18 12H2" /><path d="M2 9v6" /></svg>,
            fields: ['Account Number', 'Account Holder', 'Bank Name', 'Statement Period', 'Ending Balance'],
            examples: 'Examples: Checking account statement, Savings account statement',
            tips: 'Include statements from the last 2-3 months that show regular income deposits.'
          };
        case 'tax_return':
          return {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 p-2 bg-amber-100 text-amber-600 rounded-full" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>,
            fields: ['Taxpayer Name', 'Tax Year', 'Adjusted Gross Income', 'Total Taxable Income'],
            examples: 'Examples: Form 1040, Form 1040-EZ, Form 1040-A',
            tips: 'Include all pages of your most recent tax return filing.'
          };
        case 'w2':
          return {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 p-2 bg-purple-100 text-purple-600 rounded-full" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 12H4" /><path d="M20 12H16" /><rect width="16" height="16" x="4" y="4" rx="2" /><path d="M12 4v16" /></svg>,
            fields: ['Employer Name', 'Employee Name', 'Tax Year', 'Wages', 'Federal Income Tax Withheld'],
            examples: 'Examples: IRS W-2 Wage and Tax Statement',
            tips: 'Make sure your W-2 has your Social Security Number and is for the most recent tax year.'
          };
        default:
          return {
            icon: <FileText className="h-10 w-10 p-2 bg-gray-100 text-gray-600 rounded-full" />,
            fields: ['Various Fields'],
            examples: 'Upload a clear, complete document',
            tips: 'Make sure all text is clearly visible and the document is complete.'
          };
      }
    };
    
    const docInfo = getDocumentInfo();
    
    return (
      <Card className={`mb-4 ${uploadStatus === 'success' ? 'border-green-500 bg-green-50' : ''}`}>
        <CardHeader>
          <div className="flex items-start gap-4">
            {docInfo.icon}
            <div>
              <CardTitle className="flex items-center">
                {label}
                {uploadStatus === 'success' && <CheckCircle className="ml-2 h-5 w-5 text-green-500" />}
                {uploadStatus === 'error' && <AlertCircle className="ml-2 h-5 w-5 text-red-500" />}
                {uploadStatus === 'processing' && <Clock className="ml-2 h-5 w-5 text-amber-500" />}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {uploadStatus === 'success' ? (
            <div className="space-y-3">
              <div className="flex items-center text-sm text-green-600 bg-green-50 p-2 rounded-md">
                <CheckCircle className="mr-2 h-4 w-4" />
                <span className="font-medium">Successfully processed:</span> {documentUploads[documentType].file}
              </div>
              {documentUploads[documentType].data && (
                <div className="mt-3 p-4 bg-white border rounded-md text-sm shadow-sm">
                  <h4 className="font-semibold mb-2 text-slate-700">AI-Extracted Information:</h4>
                  <ul className="space-y-1 text-slate-600">
                    {Object.entries(documentUploads[documentType].data).map(([key, value]) => (
                      <li key={key} className="flex justify-between border-b border-dashed border-slate-200 pb-1 last:border-0">
                        <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span> 
                        <span>{String(value)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Processing Document</AlertTitle>
                <AlertDescription>
                  {documentUploads[documentType].error || 'Failed to process document. Please try uploading again.'}
                </AlertDescription>
              </Alert>
              
              <div className="mt-2">
                <Input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  disabled={isUploading}
                  onChange={(e) => handleDocumentUpload(e, documentType)} 
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-sm">
                <h4 className="font-medium mb-1">Our AI will extract these fields:</h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {docInfo.fields.map(field => (
                    <Badge key={field} variant="outline" className="bg-white">{field}</Badge>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">{docInfo.examples}</p>
              </div>
              
              <div className="border-2 border-dashed border-slate-200 rounded-md p-6 text-center hover:border-primary transition-colors">
                <Input 
                  id={`file-upload-${documentType}`}
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  disabled={isUploading}
                  onChange={(e) => handleDocumentUpload(e, documentType)} 
                  className="hidden"
                />
                <label htmlFor={`file-upload-${documentType}`} className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-slate-400" />
                  <p className="mt-2 font-medium">Drag and drop or click to upload</p>
                  <p className="text-sm text-slate-500 mt-1">PDF, JPG or PNG files (max. 10MB)</p>
                </label>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm text-blue-700">
                <strong>Tip:</strong> {docInfo.tips}
              </div>
            </div>
          )}
          
          {isUploading && documentUploads[documentType]?.file && !uploadStatus && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Processing {documentUploads[documentType].file}...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Fast Online Application</h1>
      <p className="text-muted-foreground mb-6">
        Complete your mortgage pre-approval application quickly and securely. 
        Our AI-powered system will analyze your documents instantly.
      </p>
      
      {/* Process Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="w-full flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === 'application' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <p className="mt-2 text-sm">Information</p>
          </div>
          <div className="flex-grow h-0.5 bg-gray-200"></div>
          <div className="w-full flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === 'documents' ? 'bg-green-600 text-white' : applicationSubmitted ? 'bg-gray-200' : 'bg-gray-100 text-gray-400'}`}>
              2
            </div>
            <p className="mt-2 text-sm">Documents</p>
          </div>
          <div className="flex-grow h-0.5 bg-gray-200"></div>
          <div className="w-full flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === 'confirmation' ? 'bg-green-600 text-white' : (applicationSubmitted && allDocumentsUploaded()) ? 'bg-gray-200' : 'bg-gray-100 text-gray-400'}`}>
              3
            </div>
            <p className="mt-2 text-sm">Confirmation</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="application">Personal Information</TabsTrigger>
          <TabsTrigger value="documents" disabled={!applicationSubmitted}>Document Upload</TabsTrigger>
          <TabsTrigger value="confirmation" disabled={!applicationSubmitted || !allDocumentsUploaded()}>Confirmation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="application" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal & Financial Information</CardTitle>
              <CardDescription>
                Enter your basic information to start the pre-approval process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
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
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="income"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Income</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="75,000" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your gross annual income before taxes
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="employmentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select employment status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="employed">Employed</SelectItem>
                              <SelectItem value="self-employed">Self-Employed</SelectItem>
                              <SelectItem value="retired">Retired</SelectItem>
                              <SelectItem value="unemployed">Unemployed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="creditScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credit Score Range</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select credit score range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent (720+)</SelectItem>
                            <SelectItem value="good">Good (660-719)</SelectItem>
                            <SelectItem value="fair">Fair (620-659)</SelectItem>
                            <SelectItem value="poor">Poor (below 620)</SelectItem>
                            <SelectItem value="unknown">I don't know</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Your approximate credit score range
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">
                    Continue to Document Upload <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="mt-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Upload Your Documents</CardTitle>
              <CardDescription>
                Please upload the following documents to verify your income and financial status.
                Our AI will instantly process and extract relevant information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Required Documents */}
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Required Documents</h3>
                  {renderDocumentCard('paystub', 'Pay Stub', 'Recent pay stubs from your employer (last 2-3 pay periods)')}
                  {renderDocumentCard('bank_statement', 'Bank Statement', 'Last 2-3 months of bank statements')}
                </div>
                
                {/* Optional Documents */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Additional Documents (Optional)</h3>
                  {renderDocumentCard('w2', 'W-2 Form', 'Most recent W-2 form from your employer')}
                  {renderDocumentCard('tax_return', 'Tax Return', 'Most recent federal tax return (1040 form)')}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={submitCompleteApplication} 
                disabled={!allDocumentsUploaded()} 
                className="w-full"
              >
                Complete Application <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          <div className="text-sm text-muted-foreground">
            <p className="mb-2"><strong>Note:</strong> All your documents are processed securely. We use bank-level encryption to protect your personal information.</p>
            <p>You must upload at least your Pay Stub and Bank Statement to proceed with the application.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="confirmation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-6 w-6 text-green-500" />
                Application Submitted Successfully
              </CardTitle>
              <CardDescription>
                Your mortgage pre-approval application has been submitted and is being processed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Application Received</AlertTitle>
                  <AlertDescription>
                    Your application ID is #{Math.floor(1000000 + Math.random() * 9000000)}
                  </AlertDescription>
                </Alert>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Next Steps:</h3>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Our system is now analyzing your application and documents</li>
                    <li>You will receive an email confirmation shortly</li>
                    <li>A mortgage specialist will contact you within 1 business day</li>
                    <li>Your pre-approval letter will be issued after final review</li>
                  </ol>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Return to Home
              </Button>
              <Button onClick={() => window.location.href = "/properties"}>
                Browse Properties
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}