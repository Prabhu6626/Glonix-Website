'use client';

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AuthService } from "@/lib/auth";

const Assembly = () => {
  const [smdPoints, setSmdPoints] = useState<number | null>(null);
  const [order_id, setOrderid] = useState("");
  const [thPoints, setThPoints] = useState<number | null>(null);
  const [bqlPoints, setBqlPoints] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number | null>(null);
  const quantities = ["", 5, 10, 20, 50, 100];
  const [totalPoints, setTotalPoints] = useState<number | null>(null);
  const order_type = "assembly";
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [username, setUsername] = useState("");
  const [url, setUrl] = useState("");
  const [conformalCoating, setConformalCoating] = useState("");
  const [stencil, setStencil] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const materials = [{ name: "FR4" }];

  const handleMaterialSelect = (material: string) => {
    setSelectedMaterial(material);
  };

useEffect(() => {
  // Generate a unique assembly order ID with timestamp
  const generateAssemblyOrderId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ASM-${timestamp}-${random}`;
  };

  // You can still fetch the base order ID for reference if needed
  fetch("https://glonix-service-backend.vercel.app/getnextorderid")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Base order ID from API:", data.next_order_id);
      // Generate unique assembly order ID
      const assemblyOrderId = generateAssemblyOrderId();
      setOrderid(assemblyOrderId);
      console.log("Generated assembly order ID:", assemblyOrderId);
    })
    .catch((error) => {
      console.error("Error fetching order number:", error);
      // Fallback: generate order ID even if API fails
      const fallbackOrderId = generateAssemblyOrderId();
      setOrderid(fallbackOrderId);
    });
}, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("current_user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUsername(user.email || user.full_name || "");
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, []);

  const parallelaction = useCallback(async () => {
    if (!file || !username || !order_id) return;
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", username);
    formData.append("order_id", order_id);

    try {
      const res = await fetch("https://file-store-api.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Upload successful:", data);
      setUrl(data.file_url);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }, [file, username, order_id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus(""); // Reset status
    }
  };

  const handleUpload = useCallback(async () => {
    if (!file) {
      setUploadStatus("⚠ Please select a Document file first!");
      return;
    }

    parallelaction();
    setUploadStatus("⏳ Uploading...");

    try {
      setUploadStatus("✅ Upload successful!");
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [file, parallelaction]);

  const calculateTotal = useCallback(() => {
    if (!smdPoints || !thPoints || !bqlPoints || !quantity) {
      return 0;
    }

    const confromalcoatingcalculation =
      {
        Yes: 500,
        No: 0,
      }[conformalCoating] ?? 0;
    
    const stencilcallation =
      {
        TOP: 0,
        BOTTOM: 0,
        BOTH: 200,
      }[stencil] ?? 0;
    
    const basematerial =
      {
        FR4: 4000,
      }[selectedMaterial || ""] ?? 0;

    const featurePoints = {
      confromalcoatingcalculation,
      stencilcallation,
    };
    
    const totalFeaturePoints =
      Object.values(featurePoints).reduce((acc, val) => acc + val, 0) * quantity;
    
    let smdpt = smdPoints * 0.2;
    let thpt = thPoints * 0.5;
    let bqlpt = bqlPoints * 0.8;

    return smdpt + thpt + bqlpt + totalFeaturePoints + basematerial;
  }, [smdPoints, thPoints, bqlPoints, quantity, conformalCoating, stencil, selectedMaterial]);

  useEffect(() => {
    const smd = smdPoints || 0;
    const th = thPoints || 0;
    const bql = bqlPoints || 0;
    setTotalPoints(smd + th + bql);
  }, [smdPoints, thPoints, bqlPoints]);

  // Update assembly status to 1 (visited) when price is calculated
  const price = calculateTotal().toFixed(2);
  useEffect(() => {
    if (price && price !== "0.00" && username) {
      // Get current user ID
      const userData = localStorage.getItem("current_user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          AuthService.updateAssemblyStatus(user.id, 1);
        } catch (error) {
          console.error("Failed to update assembly status:", error);
        }
      }
    }
  }, [price, username]);

  const handleAddToCart = async () => {
    // Debug: Check each field individually
    const fieldChecks = {
      username: !!username,
      order_type: !!order_type,
      selectedMaterial: !!selectedMaterial,
      quantity: !!quantity,
      smdPoints: smdPoints !== null && smdPoints >= 0,
      thPoints: thPoints !== null && thPoints >= 0,
      bqlPoints: bqlPoints !== null && bqlPoints >= 0,
      conformalCoating: !!conformalCoating,
      stencil: !!stencil,
    };

    console.log("Field validation checks:", fieldChecks);
    
    const isFormComplete = Object.values(fieldChecks).every(Boolean);
    const isFileUploaded = file && uploadStatus;
    
    if (!isFormComplete) {
      const missingFields = Object.entries(fieldChecks)
        .filter(([_, isValid]) => !isValid)
        .map(([field, _]) => field);
      console.log("Missing fields:", missingFields);
      alert(`⚠ Please fill in all required fields before proceeding. Missing: ${missingFields.join(", ")}`);
      return;
    }

    if (!isFileUploaded) {
      alert("⚠ Please upload your BOM file before submitting.");
      return;
    }
    
    const quotationData = {
      username,
      order_type,
      order_id,
      File_Url: url,
      BaseMaterial: selectedMaterial,
      Quantity: `${quantity} pcs`,
      SmdPoints: smdPoints,
      ThPoints: thPoints,
      BqlPoints: bqlPoints,
      TotalPoints: totalPoints,
      ConformalCoating: conformalCoating,
      Stencil: stencil,
      price: calculateTotal().toFixed(2),
    };
    
    if (typeof window !== 'undefined') {
      // Get current user ID for user-specific cart
      const userData = localStorage.getItem("current_user");
      if (!userData) {
        alert("⚠ Please login to add items to cart.");
        return;
      }

      try {
        const user = JSON.parse(userData);
        const userId = user.id;
        const cartKey = `cart_${userId}`;
        
        // Convert quotation data to cart item format
        const cartItem = {
          id: quotationData.order_id || `assembly-${Date.now()}`,
          name: `PCB Assembly - ${quotationData.TotalPoints} points`,
          sku: `ASM-${quotationData.TotalPoints}`,
          price: parseFloat(quotationData.price) || 0,
          image: quotationData.File_Url || "/placeholder-assembly.png",
          quantity: 1,
          inStock: true,
          // Store original quotation data for reference
          quotationData: quotationData
        };
        
        // Get existing cart items for this user
        const existingCart = localStorage.getItem(cartKey);
        let cartItems = [];
        
        if (existingCart) {
          try {
            const parsedCart = JSON.parse(existingCart);
            cartItems = Array.isArray(parsedCart) ? parsedCart : [];
          } catch (error) {
            console.error("Failed to parse existing cart:", error);
            cartItems = [];
          }
        }
        
        // Add new item to existing cart
        cartItems.push(cartItem);

        localStorage.setItem("price", quotationData.price);
        localStorage.setItem(cartKey, JSON.stringify(cartItems));
        localStorage.setItem("store", JSON.stringify(quotationData));

        // Optional: Update assembly status if method exists
        // AuthService.updateAssemblyStatus(userId, 2);
      } catch (error) {
        console.error("Failed to save cart data:", error);
        alert("⚠ Failed to add item to cart. Please try again.");
        return;
      }
    }

    alert("✅ Quotation added to cart!");
    router.push("/cart");
    reset();
  };

  const reset = () => {
    setUploadStatus("");
    setFile(null);
    setSmdPoints(null);
    setThPoints(null);
    setBqlPoints(null);
    setQuantity(null);
    setConformalCoating("");
    setStencil("");
    setSelectedMaterial(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>PCB Assembly</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload BOM File</h2>
          
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <input
              type="file"
              accept=".doc,.txt,.docx,.pdf,.zip,.rar"
              id="bomInput"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            <label 
              htmlFor="bomInput" 
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md shadow-sm transition-colors duration-200"
            >
              {file ? "Change File" : "Select BOM File"}
            </label>
            {file && (
              <p className="mt-3 text-gray-700 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {file?.name || ''}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">Supports .doc, .docx, .txt, .pdf, .zip and .rar formats</p>
          </div>

          <button 
            onClick={handleUpload}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors duration-200 disabled:opacity-50"
            disabled={!file}
          >
            Process Files
          </button>

          {uploadStatus && (
            <p className={`mt-3 text-sm ${uploadStatus.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {uploadStatus}
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">PCB Assembly Configuration</h3>
            
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-700 mb-3">Base Material</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {materials.map((material) => (
                  <button
                    key={material.name}
                    className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                      selectedMaterial === material.name 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                    onClick={() => handleMaterialSelect(material.name)}
                  >
                    {material.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-700 mb-3">PCB Quantity</label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={quantity || ""}
                onChange={(e) => setQuantity(e.target.value ? parseInt(e.target.value) : null)}
              >
                {quantities.map((q) => (
                  <option key={q} value={q}>
                    {q === "" ? "Select quantity" : `${q} pieces`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">SMD Points</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={smdPoints || ""}
                  onChange={(e) => setSmdPoints(e.target.value ? parseInt(e.target.value) : null)}
                  min="0"
                  placeholder="Enter SMD points"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">TH Points</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={thPoints || ""}
                  onChange={(e) => setThPoints(e.target.value ? parseInt(e.target.value) : null)}
                  min="0"
                  placeholder="Enter TH points"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">BGA/QFN/LGA Points</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={bqlPoints || ""}
                  onChange={(e) => setBqlPoints(e.target.value ? parseInt(e.target.value) : null)}
                  min="0"
                  placeholder="Enter BGA/QFN/LGA points"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-700 mb-3">Total Points</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                value={totalPoints || ""}
                readOnly
                placeholder="Auto-calculated"
              />
            </div>

            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-700 mb-3">Conformal Coating</label>
              <div className="flex flex-wrap gap-3">
                {["Yes", "No"].map((option) => (
                  <button
                    key={option}
                    className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                      conformalCoating === option 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                    onClick={() => setConformalCoating(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-700 mb-3">Stencil Side</label>
              <div className="flex flex-wrap gap-3">
                {["TOP", "BOTTOM", "BOTH"].map((side) => (
                  <button
                    key={side}
                    className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                      stencil === side 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                    onClick={() => setStencil(side)}
                  >
                    {side}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96 bg-white rounded-lg shadow-md p-6 h-fit sticky top-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Assembly Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">PCB Quantity:</span>
                <span className="font-medium">{quantity ? `${quantity} pcs` : '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SMD Points:</span>
                <span className="font-medium">{smdPoints ?? '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TH Points:</span>
                <span className="font-medium">{thPoints ?? '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">BGA/QFN/LGA Points:</span>
                <span className="font-medium">{bqlPoints ?? '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Points:</span>
                <span className="font-medium">{totalPoints ?? '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Base Material:</span>
                <span className="font-medium">{selectedMaterial || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conformal Coating:</span>
                <span className="font-medium">{conformalCoating || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stencil Side:</span>
                <span className="font-medium">{stencil || '--'}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between text-lg font-semibold">
                <span>Estimated Price:</span>
                <span className="text-blue-600">INR {calculateTotal().toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Final price may vary after BOM review</p>
            </div>

            <button 
              onClick={handleAddToCart}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md shadow-sm transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              Add to Cart
            </button>

            <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-1">Need help?</h4>
              <p className="text-sm text-blue-700">Our assembly experts are available 24/7 to assist with your order.</p>
              <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                Contact Support
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Assembly;