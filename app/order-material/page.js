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
import { Printer, Upload, X } from "lucide-react";

export default function OrderMaterialPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [images, setImages] = useState([]);
  
  // Form data state
  const [formData, setFormData] = useState({
    no: "SE68080067",
    date: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', ''),
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 4 - images.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    filesToAdd.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            file: file,
            url: event.target.result,
            name: file.name
          }]);
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

  return (
    <div className="flex-1 p-4 lg:p-6">
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
      <Card className="max-w-4xl mx-auto">
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
              <Label className="text-sm font-semibold">Date:</Label>
              <Input 
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="mt-1 min-h-[44px]"
              />
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
                placeholder="Z99GOWT010103"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">System:</Label>
              <Input 
                value={formData.system}
                onChange={(e) => handleInputChange('system', e.target.value)}
                className="mt-1 min-h-[44px]"
                placeholder="Sanitary"
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
              placeholder="Submersible sewage pump, outside the building at Thaweep Bridge, outbound side (front guardhouse)"
            />
          </div>

          {/* Location */}
          <div>
            <Label className="text-sm font-semibold">Location:</Label>
            <Textarea 
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="mt-1 min-h-[80px] sm:min-h-[60px]"
              placeholder="Level G0, outside the building, Thaweep Wittaya Bridge, outbound side"
            />
          </div>

          {/* Details/Problem */}
          <div>
            <Label className="text-sm font-semibold">Details/Problem:</Label>
            <Textarea 
              value={formData.detailsProblem}
              onChange={(e) => handleInputChange('detailsProblem', e.target.value)}
              className="mt-1 min-h-[100px] sm:min-h-[80px]"
              placeholder="Pump not operating"
            />
          </div>

          {/* Cause */}
          <div>
            <Label className="text-sm font-semibold">Cause:</Label>
            <Textarea 
              value={formData.cause}
              onChange={(e) => handleInputChange('cause', e.target.value)}
              className="mt-1 min-h-[80px] sm:min-h-[60px]"
              placeholder="Pump grounded"
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
                placeholder="Mr. Thanatip"
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
            <Label className="text-sm font-semibold">
              Attach Images (Maximum 4 images)
            </Label>
            
            {/* Upload Button */}
            {images.length < 4 && (
              <div className="mt-2">
                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-4 text-center hover:border-gray-400 transition-colors touch-manipulation">
                    <Upload className="h-10 w-10 sm:h-8 sm:w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-base sm:text-sm text-gray-600">
                      Click to upload images ({images.length}/4)
                    </p>
                    <p className="text-sm sm:text-xs text-gray-500 mt-1">
                      PNG, JPG, JPEG up to 10MB each
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
            )}

            {/* Image Grid */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square border rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 print:hidden"
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <p>Prepared on: 04/04/2018</p>
              <p>Revision: 1</p>
              <p>Effective Date: 04/04/2018</p>
            </div>
            <div className="mt-6">
              <p className="font-semibold">Head of Operations and Maintenance Division</p>
              <p className="mt-4">Form Code: <span className="font-mono">FM-OM-AS-12</span></p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .max-w-4xl, .max-w-4xl * {
            visibility: visible;
          }
          
          .max-w-4xl {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          
          @page {
            margin: 1in;
            size: A4;
          }
          
          .space-y-6 > * + * {
            margin-top: 1rem !important;
          }
          
          .grid {
            display: grid !important;
          }
          
          .grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          
          .gap-4 {
            gap: 1rem !important;
          }
          
          input, textarea {
            border: 1px solid #000 !important;
            background: white !important;
            color: black !important;
            padding: 4px 8px !important;
          }
          
          .font-mono {
            font-family: 'Courier New', monospace !important;
          }
          
          .text-2xl {
            font-size: 1.5rem !important;
          }
          
          .font-bold {
            font-weight: bold !important;
          }
          
          .text-center {
            text-align: center !important;
          }
          
          .border-b {
            border-bottom: 1px solid #000 !important;
          }
          
          .border-t {
            border-top: 1px solid #000 !important;
          }
          
          .grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }
          
          .aspect-square {
            aspect-ratio: 1 / 1 !important;
          }
          
          img {
            max-width: 100% !important;
            height: auto !important;
            border: 1px solid #000 !important;
          }
          
          .opacity-0 {
            opacity: 1 !important;
          }
          
          .group-hover\\:opacity-100 {
            opacity: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}