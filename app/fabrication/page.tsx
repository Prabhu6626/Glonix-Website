'use client';

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AuthService } from "@/lib/auth";
import { CustomerApiService } from "@/lib/customer-api";

const Fabrication = () => {
  const [layers, setLayers] = useState<number | null>(null);
  const [order_id, setOrderid] = useState("");
  const [thickness, setThickness] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number | null>(null);
  const quantities = ["", 5, 10, 20, 50, 100];
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<string | null>(null);
  const [selectedVia, setSelectedVia] = useState<string | null>(null);
  const order_type = "fabrication";
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [username, setUsername] = useState("");
  const [url, setUrl] = useState("");
  
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const materials = [{ name: "FR4" }];
  const colors = [{ name: "Green" }, { name: "Red" }, { name: "Blue" }, { name: "Black" }];
  const finishes = [{ name: "HASL" }, { name: "ENIG" }];
  const vias = [{ name: "Tented" }, { name: "Untented" }];

  const handleMaterialSelect = (material: string) => {
    setSelectedMaterial(material);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleFinishSelect = (finish: string) => {
    setSelectedFinish(finish);
  };

  const handleViaSelect = (via: string) => {
    setSelectedVia(via);
  };

  useEffect(() => {
    fetch("https://glonix-service-backend.vercel.app/getnextorderid")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Full API response:", data);
        setOrderid(data.next_order_id);
      })
      .catch((error) => {
        console.error("Error fetching order number:", error);
      });
  }, []);

  useEffect(() => {
    const user = AuthService.getStoredUser();
    if (user) {
      setUsername(user.email || user.full_name || "");
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
      setUploadStatus("⚠ Please select a Gerber file first!");
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
    if (!layers || !thickness || !quantity) {
      return 0;
    }

    const layerCosts = {
      1: 1000,
      2: 1500,
      4: 2000,
      6: 2500,
      8: 3000,
      10: 3500,
    };

    const thicknessCosts = {
      0.8: 0,
      1.0: 100,
      1.2: 200,
      1.6: 300,
      2.0: 400,
    };

    const colorCosts = {
      Green: 0,
      Red: 200,
      Blue: 200,
      Black: 300,
    };

    const finishCosts = {
      HASL: 0,
      ENIG: 500,
    };

    const viaCosts = {
      Tented: 0,
      Untented: 100,
    };

    const baseCost = layerCosts[layers as keyof typeof layerCosts] || 0;
    const thicknessCost = thicknessCosts[thickness as keyof typeof thicknessCosts] || 0;
    const colorCost = colorCosts[selectedColor as keyof typeof colorCosts] || 0;
    const finishCost = finishCosts[selectedFinish as keyof typeof finishCosts] || 0;
    const viaCost = viaCosts[selectedVia as keyof typeof viaCosts] || 0;

    const totalCostPerPiece = baseCost + thicknessCost + colorCost + finishCost + viaCost;
    return totalCostPerPiece * quantity;
  }, [layers, thickness, quantity, selectedColor, selectedFinish, selectedVia]);

  // Update fabrication status to 1 (visited) when price is calculated
  const price = calculateTotal().toFixed(2);
  useEffect(() => {
    if (price && price !== "0.00" && username) {
      const user = AuthService.getStoredUser();
      if (user) {
        AuthService.updateFabricationStatus(user.id, 1);
      }
    }
  }, [price, username]);

  const handleAddToCart = async () => {
    const fieldChecks = {
      username: !!username,
      order_type: !!order_type,
      selectedMaterial: !!selectedMaterial,
      layers: layers !== null && layers > 0,
      thickness: thickness !== null && thickness > 0,
      quantity: quantity !== null && quantity > 0,
      selectedColor: !!selectedColor,
      selectedFinish: !!selectedFinish,
      selectedVia: !!selectedVia,
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
      alert("⚠ Please upload your Gerber file before submitting.");
      return;
    }
    
    try {
      // Create a cart item for fabrication service
      const fabricationItem = {
        id: order_id || `fab-${Date.now()}`,
        name: `PCB Fabrication - ${layers} layers`,
        sku: `FAB-${layers}L-${thickness}MM`,
        price: parseFloat(price) || 0,
        image: url || "/placeholder-pcb.png",
        inStock: true,
      };

      // Add to cart via API
      const success = await CustomerApiService.addToCart(fabricationItem.id, 1);
      
      if (success) {
        alert("✅ Fabrication service added to cart!");
        router.push("/cart");
        reset();
      } else {
        throw new Error("Failed to add to cart");
      }
    } catch (error) {
      console.error("Failed to add fabrication to cart:", error);
      alert("⚠ Failed to add item to cart. Please try again.");
    }
  };

  const reset = () => {
    setUploadStatus("");
    setFile(null);
    setLayers(null);
    setThickness(null);
    setQuantity(null);
    setSelectedColor(null);
    setSelectedFinish(null);
    setSelectedVia(null);
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
                <BreadcrumbPage>PCB Fabrication</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Gerber Files</h2>
          
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <input
              type="file"
              accept=".zip,.rar,.7z"
              id="gerberInput"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            <label 
              htmlFor="gerberInput" 
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md shadow-sm transition-colors duration-200"
            >
              {file ? "Change File" : "Select Gerber Files"}
            </label>
            {file && (
              <p className="mt-3 text-gray-700 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {file?.name || ''}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">Supports .zip, .rar and .7z formats</p>
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
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">PCB Specifications</h3>
            
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
              <label className="block text-lg font-medium text-gray-700 mb-3">Number of Layers</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[1, 2, 4, 6, 8, 10].map((layer) => (
                  <button
                    key={layer}
                    className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                      layers === layer 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                    onClick={() => setLayers(layer)}
                  >
                    {layer}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-700 mb-3">PCB Thickness (mm)</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[0.8, 1.0, 1.2, 1.6, 2.0].map((thick) => (
                  <button
                    key={thick}
                    className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                      thickness === thick 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                    onClick={() => setThickness(thick)}
                  >
                    {thick}mm
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

            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-700 mb-3">Solder Mask Color</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                      selectedColor === color.name 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                    onClick={() => handleColorSelect(color.name)}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-700 mb-3">Surface Finish</label>
              <div className="grid grid-cols-2 gap-3">
                {finishes.map((finish) => (
                  <button
                    key={finish.name}
                    className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                      selectedFinish === finish.name 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                    onClick={() => handleFinishSelect(finish.name)}
                  >
                    {finish.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-700 mb-3">Via Covering</label>
              <div className="grid grid-cols-2 gap-3">
                {vias.map((via) => (
                  <button
                    key={via.name}
                    className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                      selectedVia === via.name 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                    onClick={() => handleViaSelect(via.name)}
                  >
                    {via.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96 bg-white rounded-lg shadow-md p-6 h-fit sticky top-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Fabrication Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Material:</span>
                <span className="font-medium">{selectedMaterial || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Layers:</span>
                <span className="font-medium">{layers || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thickness:</span>
                <span className="font-medium">{thickness ? `${thickness}mm` : '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{quantity ? `${quantity} pcs` : '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Solder Mask:</span>
                <span className="font-medium">{selectedColor || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Surface Finish:</span>
                <span className="font-medium">{selectedFinish || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Via Covering:</span>
                <span className="font-medium">{selectedVia || '--'}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between text-lg font-semibold">
                <span>Estimated Price:</span>
                <span className="text-blue-600">INR {calculateTotal().toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Final price may vary after design review</p>
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
              <p className="text-sm text-blue-700">Our fabrication experts are available 24/7 to assist with your order.</p>
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

export default Fabrication;