"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseClient";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Printer, Upload, X, AlertCircle, CheckCircle, Expand, ZoomIn, ZoomOut, Download, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function OrderMaterialPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [images, setImages] = useState([]);
  const [showMaxImagesAlert, setShowMaxImagesAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [rejectedFilesCount, setRejectedFilesCount] = useState(0);
  
  // Form data state
  const [formData, setFormData] = useState({
    no: "SE68080067",
    equipmentCode: "",
    system: "",
    department: "Maintenance",
    printedBy: "",
    equipmentName: "",
    location: "",
    detailsProblem: "",
    cause: "",
    remarks: "",
    assetCode: "",
    reportedBy: "",
    recordedBy: ""
  });

  // Auth check and get user name
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const res = await fetch(`/api/admin/details?email=${user.email}`);
          const adminData = await res.json();
          const username = adminData.username || adminData.name || user.email;
          setUserName(username);
          setFormData(prev => ({
            ...prev,
            printedBy: username,
            recordedBy: username
          }));
        } catch (err) {
          console.error("Failed to fetch admin details", err);
          setUserName(user.email);
          setFormData(prev => ({
            ...prev,
            printedBy: user.email,
            recordedBy: user.email
          }));
        }
      } else {
        router.push("/Log-in");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Update current date/time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrint = () => {
    // Update to current date/time when printing
    setCurrentDateTime(new Date());
    setTimeout(() => {
      window.print();
    }, 100);
  };
  
  // Get formatted date and time for display
  const getFormattedDateTime = () => {
    return format(currentDateTime, 'dd/MM/yyyy HH:mm');
  };
  
  // Get formatted date only
  const getFormattedDate = () => {
    return format(currentDateTime, 'dd/MM/yyyy');
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const currentCount = images.length;
    const remainingSlots = 4 - currentCount;
    
    // Hide any existing alerts first
    setShowSuccessAlert(false);
    setShowMaxImagesAlert(false);
    
    // Check if no slots remaining
    if (remainingSlots === 0) {
      setRejectedFilesCount(files.length);
      setTimeout(() => {
        setShowMaxImagesAlert(true);
        setTimeout(() => setShowMaxImagesAlert(false), 8000);
      }, 100);
      e.target.value = '';
      return;
    }
    
    // Reject entire upload if it would exceed limit
    if (files.length > remainingSlots) {
      setRejectedFilesCount(files.length);
      setTimeout(() => {
        setShowMaxImagesAlert(true);
        setTimeout(() => setShowMaxImagesAlert(false), 8000);
      }, 100);
      e.target.value = '';
      return; // Don't process any files at all
    }
    
    // Only process files if they ALL fit within the limit
    let successCount = 0;
    const newImages = [];
    
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        successCount++;
        const reader = new FileReader();
        reader.onload = (event) => {
          newImages.push({
            id: Date.now() + Math.random(),
            file: file,
            url: event.target.result,
            name: file.name
          });
          
          // Only update state after all images are read
          if (newImages.length === successCount) {
            setImages(prev => [...prev, ...newImages]);
            setUploadedCount(successCount);
            setTimeout(() => {
              setShowSuccessAlert(true);
              setTimeout(() => setShowSuccessAlert(false), 7000);
            }, 100);
          }
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Reset the input
    e.target.value = '';
  };

  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const openImageViewer = (image) => {
    setSelectedImage(image);
    setImageZoom(1);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
    setImageZoom(1);
  };

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownloadImage = () => {
    if (selectedImage) {
      const link = document.createElement('a');
      link.href = selectedImage.url;
      link.download = selectedImage.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-6">
      {/* Max Images Alert Toast */}
      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        showMaxImagesAlert ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}>
        <div className="bg-white border border-orange-200 rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[350px] max-w-[500px]">
          <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Upload Rejected - Maximum Images Exceeded</h3>
            <p className="text-sm text-gray-600">
              {rejectedFilesCount > 0 ? 
                `Cannot upload ${rejectedFilesCount} image${rejectedFilesCount > 1 ? 's' : ''}. ` : 
                ''
              }
              You can only attach up to 4 images total. {images.length > 0 ? `You currently have ${images.length} image${images.length > 1 ? 's' : ''} attached.` : ''} 
              {4 - images.length > 0 ? 
                ` You can only add ${4 - images.length} more image${4 - images.length > 1 ? 's' : ''}.` : 
                ' Please remove existing images before adding new ones.'
              }
            </p>
          </div>
          <button
            onClick={() => setShowMaxImagesAlert(false)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Success Alert Toast */}
      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        showSuccessAlert ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}>
        <div className="bg-white border border-green-200 rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[350px] max-w-[500px]">
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Images Attached Successfully</h3>
            <p className="text-sm text-gray-600">
              {uploadedCount} image{uploadedCount > 1 ? 's have' : ' has'} been attached successfully. 
              {4 - images.length > 0 ? ` You can still add ${4 - images.length} more image${4 - images.length > 1 ? 's' : ''}.` : ' You have reached the maximum limit.'}
            </p>
          </div>
          <button
            onClick={() => setShowSuccessAlert(false)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm print:hidden">
          {/* Close button overlay */}
          <div className="absolute inset-0" onClick={closeImageViewer} />
          
          {/* Modal Content */}
          <div className="relative z-10 max-w-[90vw] max-h-[90vh] flex flex-col bg-white rounded-lg shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{selectedImage.name}</h3>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {Math.round(imageZoom * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={handleDownloadImage}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={closeImageViewer}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Image Container */}
            <div className="overflow-auto p-4 bg-gray-50" style={{maxHeight: 'calc(90vh - 80px)'}}>
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                style={{
                  transform: `scale(${imageZoom})`,
                  transformOrigin: 'center',
                  transition: 'transform 0.2s ease-in-out',
                  maxWidth: '100%',
                  display: 'block',
                  margin: 'auto'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 print:hidden">
        <h1 className="text-2xl lg:text-3xl font-bold mb-3 sm:mb-0">Order Material</h1>
        <Button 
          onClick={handlePrint}
          className="flex items-center gap-2 min-h-[44px] px-4"
          size="lg"
        >
          <Printer className="h-4 w-4" />
          Print Form
        </Button>
      </div>

      {/* Form Card */}
      <Card className="max-w-4xl mx-auto screen-only">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-2xl font-bold">Equipment Repair Request Form</CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Form Number and Date */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div className="w-full sm:w-auto">
              <Label className="text-sm font-semibold">No.</Label>
              <Input 
                value={formData.no}
                onChange={(e) => handleInputChange('no', e.target.value)}
                className="mt-1 font-mono min-h-[44px]"
                placeholder="SE68080067"
              />
            </div>
            <div className="w-full sm:w-auto">
              <Label className="text-sm font-semibold">Date & Time:</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md border min-h-[44px] flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-gray-700 font-mono">{getFormattedDateTime()}</span>
                <span className="ml-2 text-xs text-gray-500">(Current time)</span>
              </div>
            </div>
          </div>

          {/* Equipment Code and System */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold">Equipment Code:</Label>
              <Input 
                value={formData.equipmentCode}
                onChange={(e) => handleInputChange('equipmentCode', e.target.value)}
                className="mt-1 min-h-[44px]"
                placeholder="Eg. Z99GOWT010103"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">System:</Label>
              <Input 
                value={formData.system}
                onChange={(e) => handleInputChange('system', e.target.value)}
                className="mt-1 min-h-[44px]"
                placeholder="Eg. Sanitary"
              />
            </div>
          </div>

          {/* Department and Printed By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold">Department:</Label>
              <Input 
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="mt-1 min-h-[44px]"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Printed by:</Label>
              <Input 
                value={formData.printedBy}
                onChange={(e) => handleInputChange('printedBy', e.target.value)}
                className="mt-1 min-h-[44px]"
              />
            </div>
          </div>

          {/* Equipment Name */}
          <div>
            <Label className="text-sm font-semibold">Equipment Name:</Label>
            <Textarea 
              value={formData.equipmentName}
              onChange={(e) => handleInputChange('equipmentName', e.target.value)}
              className="mt-1 min-h-[80px] sm:min-h-[60px]"
              placeholder="Eg. Submersible sewage pump, outside the building at Thaweep Bridge, outbound side (front guardhouse)"
            />
          </div>

          {/* Location */}
          <div>
            <Label className="text-sm font-semibold">Location:</Label>
            <Textarea 
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="mt-1 min-h-[80px] sm:min-h-[60px]"
              placeholder="Eg. Level G0, outside the building, Thaweep Wittaya Bridge, outbound side"
            />
          </div>

          {/* Details/Problem */}
          <div>
            <Label className="text-sm font-semibold">Details/Problem:</Label>
            <Textarea 
              value={formData.detailsProblem}
              onChange={(e) => handleInputChange('detailsProblem', e.target.value)}
              className="mt-1 min-h-[100px] sm:min-h-[80px]"
              placeholder="Eg. Pump not operating"
            />
          </div>

          {/* Cause */}
          <div>
            <Label className="text-sm font-semibold">Cause:</Label>
            <Textarea 
              value={formData.cause}
              onChange={(e) => handleInputChange('cause', e.target.value)}
              className="mt-1 min-h-[80px] sm:min-h-[60px]"
              placeholder="Eg. Pump grounded"
            />
          </div>

          {/* Remarks and Asset Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold">Remarks:</Label>
              <Input 
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                className="mt-1 min-h-[44px]"
                placeholder="RF"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Asset Code:</Label>
              <Input 
                value={formData.assetCode}
                onChange={(e) => handleInputChange('assetCode', e.target.value)}
                className="mt-1 min-h-[44px]"
              />
            </div>
          </div>

          {/* Reported By and Recorded By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold">Reported by:</Label>
              <Input 
                value={formData.reportedBy}
                onChange={(e) => handleInputChange('reportedBy', e.target.value)}
                className="mt-1 min-h-[44px]"
                placeholder="Eg. Mr. Thanatip"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Recorded by:</Label>
              <Input 
                value={formData.recordedBy}
                onChange={(e) => handleInputChange('recordedBy', e.target.value)}
                className="mt-1 min-h-[44px]"
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold">
                Attach Images
              </Label>
              <span className={`text-xs px-2 py-1 rounded-full ${
                images.length === 4 
                  ? 'bg-orange-100 text-orange-700' 
                  : images.length > 0 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {images.length}/4 images
              </span>
            </div>
            
            {/* Upload Button */}
            {images.length < 4 ? (
              <div className="mt-2">
                <label className="cursor-pointer">
                  <div className={`border-2 border-dashed rounded-lg p-6 sm:p-4 text-center transition-all ${
                    images.length === 0 
                      ? 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50' 
                      : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}>
                    <Upload className="h-10 w-10 sm:h-8 sm:w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-base sm:text-sm font-medium text-gray-700">
                      Click to upload images
                    </p>
                    <p className="text-sm sm:text-xs text-gray-500 mt-1">
                      {4 - images.length} slot{4 - images.length !== 1 ? 's' : ''} remaining • PNG, JPG, JPEG (max 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="mt-2 border-2 border-dashed border-orange-200 rounded-lg p-6 sm:p-4 text-center bg-orange-50/50">
                <AlertCircle className="h-10 w-10 sm:h-8 sm:w-8 mx-auto text-orange-400 mb-2" />
                <p className="text-base sm:text-sm font-medium text-orange-700">
                  Maximum images reached
                </p>
                <p className="text-sm sm:text-xs text-orange-600 mt-1">
                </p>
              </div>
            )}

            {/* Image Grid */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div 
                      className="aspect-square border rounded-lg overflow-hidden bg-gray-50 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => openImageViewer(image)}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                      {/* Expand icon overlay */}
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="bg-white/90 rounded-full p-2">
                          <Expand className="h-5 w-5 text-gray-700" />
                        </div>
                      </div>
                    </div>
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 print:hidden z-10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {/* Image name */}
                    <p className="text-xs text-gray-600 mt-1 truncate" title={image.name}>
                      {image.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Information */}
          <div className="mt-8 pt-6 border-t space-y-2 text-sm text-gray-600">
            <p><strong>Operations and Maintenance Division</strong></p>
            <div className="mt-4">
              <div className="flex justify-between">
                <p>Prepared on: {getFormattedDate()}</p>
                <p>Effective Date: {getFormattedDate()}</p>
              </div>
              <p className="text-center mt-2">Revision: 1</p>
            </div>
            <div className="mt-6">
              <p className="font-semibold">Head of Operations and Maintenance Division</p>
              <p className="mt-4">Form Code: <span className="font-mono">FM-OM-AS-12</span></p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print view only content - COMPLETELY REDESIGNED */}
      <div className="print-only-content">
        <style jsx global>{`
          .print-only-content {
            display: none;
          }
          
          @media print {
            @page {
              size: A4;
              margin: 20mm 15mm;
            }
            
            html, body {
              height: 100%;
              overflow: hidden;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            body * {
              visibility: hidden;
            }
            
            .screen-only,
            .screen-only * {
              visibility: hidden !important;
            }
            
            .print-only-content,
            .print-only-content * {
              visibility: visible !important;
            }
            
            .print-only-content {
              display: block !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: 100vh !important;
              max-height: 297mm !important;
              background: white !important;
              overflow: hidden !important;
              page-break-after: avoid !important;
              padding: 0 !important;
            }
          }
        `}</style>
        
        <div style={{width: '100%', height: '257mm', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0'}}>
          {/* Title */}
          <h1 style={{
            textAlign: 'center',
            fontSize: '18pt',
            fontWeight: 'bold',
            borderBottom: '2px solid #000',
            paddingBottom: '8px',
            marginBottom: '10px'
          }}>
            Equipment Repair Request Form
          </h1>
          
          {/* Form Table */}
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '10pt',
            marginBottom: '12px'
          }}>
            <tbody>
              <tr>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '15%', backgroundColor: '#f5f5f5', fontSize: '10pt'}}>No.</td>
                <td style={{border: '1px solid #000', padding: '6px 8px', width: '35%', fontSize: '10pt'}}>{formData.no}</td>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '15%', backgroundColor: '#f5f5f5', fontSize: '10pt'}}>Date:</td>
                <td style={{border: '1px solid #000', padding: '6px 8px', width: '35%', fontSize: '10pt'}}>{getFormattedDateTime()}</td>
              </tr>
              <tr>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '10pt'}}>Equipment Code:</td>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontSize: '10pt'}}>{formData.equipmentCode || ' '}</td>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '10pt'}}>System:</td>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontSize: '10pt'}}>{formData.system || ' '}</td>
              </tr>
              <tr>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '10pt'}}>Department:</td>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontSize: '10pt'}}>{formData.department}</td>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '10pt'}}>Printed by:</td>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontSize: '10pt'}}>{formData.printedBy}</td>
              </tr>
              <tr>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '10pt'}}>Equipment Name:</td>
                <td style={{border: '1px solid #000', padding: '6px 8px', minHeight: '30px', fontSize: '10pt'}} colSpan={3}>{formData.equipmentName || ' '}</td>
              </tr>
              <tr>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '10pt'}}>Location:</td>
                <td style={{border: '1px solid #000', padding: '6px 8px', minHeight: '30px', fontSize: '10pt'}} colSpan={3}>{formData.location || ' '}</td>
              </tr>
              <tr>
                <td style={{border: '1px solid #000', padding: '8px', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '10pt', verticalAlign: 'top'}}>Details/Problem:</td>
                <td style={{border: '1px solid #000', padding: '8px', minHeight: '45px', verticalAlign: 'top', fontSize: '10pt'}} colSpan={3}>{formData.detailsProblem || ' '}</td>
              </tr>
              <tr>
                <td style={{border: '1px solid #000', padding: '8px', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '10pt', verticalAlign: 'top'}}>Cause:</td>
                <td style={{border: '1px solid #000', padding: '8px', minHeight: '35px', verticalAlign: 'top', fontSize: '10pt'}} colSpan={3}>{formData.cause || ' '}</td>
              </tr>
              <tr>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '10pt'}}>Remarks:</td>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontSize: '10pt'}}>{formData.remarks || ' '}</td>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '10pt'}}>Asset Code:</td>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontSize: '10pt'}}>{formData.assetCode || ' '}</td>
              </tr>
              <tr>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '10pt'}}>Reported by:</td>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontSize: '10pt'}}>{formData.reportedBy || ' '}</td>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '10pt'}}>Recorded by:</td>
                <td style={{border: '1px solid #000', padding: '6px 8px', fontSize: '10pt'}}>{formData.recordedBy || ' '}</td>
              </tr>
            </tbody>
          </table>
          
          {/* Images Section - LARGER 2x2 GRID */}
          <div style={{display: 'flex', flexDirection: 'column', marginTop: '12px', flex: 1}}>
            <div style={{fontWeight: 'bold', fontSize: '11pt', marginBottom: '8px'}}>
              Attach Images (Maximum 4 images)
            </div>
            <div style={{
              border: '2px dashed #666',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '280px'
            }}>
              {images.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  width: '100%',
                  height: '100%',
                  maxWidth: '270px'
                }}>
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} style={{
                      border: '1px solid #000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f9f9f9',
                      width: '125px',
                      height: '125px'
                    }}>
                      {images[index] ? (
                        <img 
                          src={images[index].url} 
                          alt={`Image ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      ) : (
                        <div style={{
                          color: '#ccc',
                          fontSize: '9pt',
                          textAlign: 'center'
                        }}>
                          No Image
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  width: '270px',
                  height: '270px'
                }}>
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} style={{
                      width: '125px',
                      height: '125px',
                      border: '1px solid #ccc',
                      backgroundColor: '#f9f9f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                      fontSize: '9pt'
                    }}>
                      Image {num}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div style={{
            borderTop: '2px solid #000',
            paddingTop: '8px',
            marginTop: 'auto',
            fontSize: '9pt'
          }}>
            <div style={{fontWeight: 'bold', fontSize: '10pt'}}>Operations and Maintenance Division</div>
            <div style={{marginTop: '6px', fontSize: '8pt'}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span>Prepared on: {getFormattedDate()}</span>
                <span style={{visibility: 'hidden'}}>Spacer</span>
                <span>Effective Date: {getFormattedDate()}</span>
              </div>
              <div style={{textAlign: 'center', marginTop: '4px'}}>
                <span>Revision: 1</span>
              </div>
            </div>
            <div style={{marginTop: '8px'}}>
              <div style={{fontWeight: 'bold', fontSize: '10pt'}}>Head of Operations and Maintenance Division</div>
              <div style={{marginTop: '6px', fontFamily: 'monospace', fontSize: '8pt'}}>Form Code: FM-OM-AS-12</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}