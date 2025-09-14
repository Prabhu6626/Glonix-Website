'use client';

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AuthService } from "@/lib/auth";

const Fabrication = () => {
  const [layers, setLayers] = useState<number | null>(null);
  const order_type = "fabrication";
  const [quantity, setQuantity] = useState<number | null>(null);
  const layerOptions = [1, 2, 4, 6, 8, 10, "10+"];
  const quantities = ["", 5, 10, 20, 50, 100];
  const [design, setDesign] = useState(1);
  const [delivery, setDelivery] = useState("");
  const [thickness, setThickness] = useState<number | undefined>(undefined);
  const [color, setColor] = useState("");
  const [silkscreen, setSilkscreen] = useState("");
  const [finish, setFinish] = useState("");
  const [copperWeight, setCopperWeight] = useState("");
  const [viaCovering, setViaCovering] = useState("");
  const [viaSize, setViaSize] = useState("No");
  const [Tg, setTg] = useState("");
  const [Orederremove, setOrderremove] = useState("");
  const [ftest, setFtest] = useState("");
  const [goldfinger, setGoldfinger] = useState("");
  
  const router = useRouter();
  
  const [file, setFile] = useState<File | null>(null);
  const [pcbImage, setPcbImage] = useState({ top: "", bottom: "" });
  const [pcbDimensions, setPcbDimensions] = useState({ width: "", height: "" });
  const [uploadStatus, setUploadStatus] = useState("");
  const [url, setUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [order_id, setOrderid] = useState("");

  const materials = [{ name: "FR4" }];

  const handleMaterialSelect = (material: string) => {
    setSelectedMaterial(material);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus(""); // Reset status
      setPcbImage({ top: "", bottom: "" }); // Clear previous image
    }
  };

useEffect(() => {
  // Generate a unique fabrication order ID with timestamp
  const generateFabricationOrderId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FAB-${timestamp}-${random}`;
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
      // Generate unique fabrication order ID
      const fabricationOrderId = generateFabricationOrderId();
      setOrderid(fabricationOrderId);
      console.log("Generated fabrication order ID:", fabricationOrderId);
    })
    .catch((error) => {
      console.error("Error fetching order number:", error);
      // Fallback: generate order ID even if API fails
      const fallbackOrderId = generateFabricationOrderId();
      setOrderid(fallbackOrderId);
    });
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

  const handleUpload = useCallback(async () => {
    if (!file) {
      setUploadStatus("⚠ Please select a Gerber file first!");
      return;
    }

    parallelaction();
    setUploadStatus("⏳ Uploading...");

    const formData = new FormData();
    formData.append("file", file);

    // Parse value and unit from string like "2.312in"
    const parseValueWithUnit = (valueStr: string) => {
      const match = /^([\d.]+)\s*(mm|cm|in|inch|mil)?$/i.exec(valueStr);
      if (!match) return { value: NaN, unit: "mm" }; // fallback
      return {
        value: parseFloat(match[1]),
        unit: (match[2] || "mm").toLowerCase(),
      };
    };

    // Convert to millimeters
    const convertToMM = (value: number, unit: string = "mm"): number | "Unknown" => {
      if (isNaN(value)) return "Unknown";
      switch (unit) {
        case "in":
        case "inch":
          return value * 25.4;
        case "cm":
          return value * 10;
        case "mil":
          return value * 0.0254;
        case "mm":
        default:
          return value;
      }
    };

    try {
      const response = await fetch(
        "https://gerberrenderbackend.vercel.app/upload",
        {
          method: "POST",
          body: formData,
          mode: "cors",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("API response:", data);

      if (!data.files || !data.files["stitched_horizontal.png"] || !data.files["bottom.png"]) {
        throw new Error("Invalid response: Missing file paths");
      }

      const topImageUrl = data.files["stitched_horizontal.png"].path;
      const bottomImageUrl = data.files["bottom.png"].path;

      // Parse and convert dimensions
      const { value: widthValue, unit: widthUnit } = parseValueWithUnit(
        data.width || ""
      );
      const { value: heightValue, unit: heightUnit } = parseValueWithUnit(
        data.height || ""
      );

      const pcbWidthMM = convertToMM(widthValue, widthUnit);
      const pcbHeightMM = convertToMM(heightValue, heightUnit);

      const pcbWidth = typeof pcbWidthMM === 'number' ? pcbWidthMM.toFixed(2) : "Unknown";
      const pcbHeight = typeof pcbHeightMM === 'number' ? pcbHeightMM.toFixed(2) : "Unknown";

      console.log("Parsed width:", pcbWidth, "mm");
      console.log("Parsed height:", pcbHeight, "mm");

      setPcbImage({ top: topImageUrl, bottom: bottomImageUrl });

      if (pcbWidth === "Unknown" || pcbHeight === "Unknown") {
        setUploadStatus("⚠ Upload successful, but dimensions are unavailable.");
      } else {
        setPcbDimensions({ width: pcbWidth, height: pcbHeight });
        setUploadStatus("✅ Upload successful!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [file, parallelaction]);

  function getBoardPrice(layers: number) {
    if (layers === 1) {
      return 1750;
    } else if (layers === 2) {
      return 2250;
    } else if (layers > 3) {
      return 5000;
    }
  }

  const getCostofmm = useCallback((layers: number, totalarea: number) => {
    // rangeData.js
    const rangeData = [
      { range1: 0, range2: 20, sqarea: 20 },
      { range1: 21, range2: 40, sqarea: 40 },
      { range1: 41, range2: 60, sqarea: 60 },
      { range1: 61, range2: 80, sqarea: 80 },
      { range1: 81, range2: 100, sqarea: 100 },
      { range1: 101, range2: 120, sqarea: 120 },
      { range1: 121, range2: 160, sqarea: 160 },
      { range1: 161, range2: 200, sqarea: 200 },
      { range1: 201, range2: 300, sqarea: 300 },
      { range1: 301, range2: 400, sqarea: 400 },
      { range1: 401, range2: 500, sqarea: 500 },
      { range1: 501, range2: 600, sqarea: 600 },
      { range1: 601, range2: 800, sqarea: 800 },
      { range1: 801, range2: 1000, sqarea: 1000 },
      { range1: 1001, range2: 1125, sqarea: 1125 },
      { range1: 1126, range2: 1200, sqarea: 1200 },
      { range1: 1201, range2: 1400, sqarea: 1400 },
      { range1: 1401, range2: 1600, sqarea: 1600 },
      { range1: 1601, range2: 1800, sqarea: 1800 },
      { range1: 1801, range2: 2000, sqarea: 2000 },
      { range1: 2001, range2: 2250, sqarea: 2250 },
      { range1: 2251, range2: 2400, sqarea: 2400 },
      { range1: 2401, range2: 2800, sqarea: 2800 },
      { range1: 2801, range2: 3200, sqarea: 3200 },
      { range1: 3201, range2: 3375, sqarea: 3375 },
      { range1: 3376, range2: 3600, sqarea: 3600 },
      { range1: 3601, range2: 4000, sqarea: 4000 },
      { range1: 4001, range2: 4500, sqarea: 4500 },
      { range1: 4501, range2: 5625, sqarea: 5625 },
      { range1: 5626, range2: 6000, sqarea: 6000 },
      { range1: 6001, range2: 6750, sqarea: 6750 },
      { range1: 6751, range2: 8000, sqarea: 8000 },
      { range1: 8001, range2: 9000, sqarea: 9000 },
      { range1: 9001, range2: 10000, sqarea: 10000 },
      { range1: 10001, range2: 11250, sqarea: 11250 },
      { range1: 11251, range2: 12000, sqarea: 12000 },
      { range1: 12001, range2: 14000, sqarea: 14000 },
      { range1: 14001, range2: 16000, sqarea: 16000 },
      { range1: 16001, range2: 16875, sqarea: 16875 },
      { range1: 16876, range2: 18000, sqarea: 18000 },
      { range1: 18001, range2: 20000, sqarea: 20000 },
      { range1: 20001, range2: 22000, sqarea: 22000 },
      { range1: 22001, range2: 22500, sqarea: 22500 },
      { range1: 22501, range2: 24000, sqarea: 24000 },
      { range1: 24001, range2: 26000, sqarea: 26000 },
      { range1: 26001, range2: 28000, sqarea: 28000 },
      { range1: 28001, range2: 28125, sqarea: 28125 },
      { range1: 28126, range2: 30000, sqarea: 30000 },
      { range1: 30001, range2: 32000, sqarea: 32000 },
      { range1: 32001, range2: 33750, sqarea: 33750 },
      { range1: 33751, range2: 36000, sqarea: 36000 },
      { range1: 36001, range2: 40000, sqarea: 40000 },
      { range1: 40001, range2: 45000, sqarea: 45000 },
      { range1: 45001, range2: 50000, sqarea: 50000 },
      { range1: 50001, range2: 56250, sqarea: 56250 },
      { range1: 56251, range2: 60000, sqarea: 60000 },
      { range1: 60001, range2: 67500, sqarea: 67500 },
      { range1: 67501, range2: 78750, sqarea: 78750 },
      { range1: 78751, range2: 80000, sqarea: 80000 },
      { range1: 80001, range2: 90000, sqarea: 90000 },
      { range1: 90001, range2: 100000, sqarea: 100000 },
      { range1: 100001, range2: 101250, sqarea: 101250 },
      { range1: 101251, range2: 112500, sqarea: 112500 },
      { range1: 112501, range2: 135000, sqarea: 135000 },
      { range1: 135001, range2: 150000, sqarea: 150000 },
      { range1: 150001, range2: 157500, sqarea: 157500 },
      { range1: 157501, range2: 180000, sqarea: 180000 },
      { range1: 180001, range2: 200000, sqarea: 200000 },
      { range1: 200001, range2: 202500, sqarea: 202500 },
      { range1: 202501, range2: 225000, sqarea: 225000 },
      { range1: 225001, range2: 250000, sqarea: 250000 },
      { range1: 250001, range2: 300000, sqarea: 300000 },
      { range1: 300001, range2: 337500, sqarea: 337500 },
      { range1: 337501, range2: 400000, sqarea: 400000 },
      { range1: 400001, range2: 450000, sqarea: 450000 },
      { range1: 450001, range2: 500000, sqarea: 500000 },
      { range1: 500001, range2: 562500, sqarea: 562500 },
      { range1: 562501, range2: 600000, sqarea: 600000 },
      { range1: 600001, range2: 675000, sqarea: 675000 },
      { range1: 675001, range2: 700000, sqarea: 700000 },
      { range1: 700001, range2: 787500, sqarea: 787500 },
      { range1: 787501, range2: 800000, sqarea: 800000 },
      { range1: 800001, range2: 900000, sqarea: 900000 },
      { range1: 900001, range2: 1000000, sqarea: 1000000 },
      { range1: 1000001, range2: 1012500, sqarea: 1012500 },
      { range1: 1012501, range2: 1125000, sqarea: 1125000 },
      { range1: 1125001, range2: 1200000, sqarea: 1200000 },
      { range1: 1200001, range2: 1237500, sqarea: 1237500 },
      { range1: 1237501, range2: 1350000, sqarea: 1350000 },
      { range1: 1350001, range2: 1400000, sqarea: 1400000 },
      { range1: 1400001, range2: 1462500, sqarea: 1462500 },
      { range1: 1462501, range2: 1575000, sqarea: 1575000 },
      { range1: 1575001, range2: 1600000, sqarea: 1600000 },
      { range1: 1600001, range2: 1687500, sqarea: 1687500 },
      { range1: 1687501, range2: 1800000, sqarea: 1800000 },
      { range1: 1800001, range2: 2000000, sqarea: 2000000 },
      { range1: 2000001, range2: 2025000, sqarea: 2025000 },
      { range1: 2025001, range2: 2250000, sqarea: 2250000 },
      { range1: 2250001, range2: 2500000, sqarea: 2500000 },
      { range1: 2500001, range2: 3000000, sqarea: 3000000 },
      { range1: 3000001, range2: 3375000, sqarea: 3375000 },
      { range1: 3375001, range2: 4000000, sqarea: 4000000 },
      { range1: 4000001, range2: 4500000, sqarea: 4500000 },
      { range1: 4500001, range2: 5000000, sqarea: 5000000 },
      { range1: 5000001, range2: 5625000, sqarea: 5625000 },
      { range1: 5625001, range2: 6000000, sqarea: 6000000 },
      { range1: 6000001, range2: 6750000, sqarea: 6750000 },
      { range1: 6750001, range2: 7000000, sqarea: 7000000 },
      { range1: 7000001, range2: 7875000, sqarea: 7875000 },
      { range1: 7875001, range2: 8000000, sqarea: 8000000 },
      { range1: 8000001, range2: 9000000, sqarea: 9000000 },
      { range1: 9000001, range2: 10000000, sqarea: 10000000 },
    ];

    const sqcmRates = {
      20: 281.0, 40: 141.0, 60: 96.0, 80: 72.0, 100: 59.0, 120: 48.0, 160: 37.0, 200: 30.0,
      300: 21.0, 400: 16.0, 500: 13.0, 600: 11.0, 800: 9.0, 1000: 8.0, 1125: 7.0, 1200: 6.0,
      1400: 6.0, 1600: 5.0, 1800: 5.0, 2000: 5.0, 2250: 4.0, 2400: 4.0, 2800: 4.0, 3200: 4.0,
      3375: 4.0, 3600: 4.0, 4000: 4.0, 4500: 4.0, 5625: 4.0, 6000: 4.0, 6750: 4.0, 8000: 4.0,
      9000: 4.0, 10000: 4.0, 11250: 3.0, 12000: 3.0, 14000: 3.0, 16000: 3.0, 16875: 3.0,
      18000: 3.0, 20000: 3.0, 22000: 3.0, 22500: 3.0, 24000: 3.0, 26000: 3.0, 28000: 3.0,
      28125: 3.0, 30000: 2.5, 32000: 2.5, 33750: 2.5, 36000: 2.5, 40000: 2.5, 45000: 2.0,
      50000: 2.0, 56250: 2.0, 60000: 2.0, 67500: 2.0, 78750: 2.0, 80000: 2.0, 90000: 2.0,
      100000: 1.5, 101250: 1.5, 112500: 1.5, 135000: 1.5, 150000: 1.5, 157500: 1.5,
      180000: 1.5, 200000: 1.5, 202500: 1.5, 225000: 1.5, 250000: 1.5, 300000: 1.5,
      337500: 1.5, 400000: 1.5, 450000: 1.5, 500000: 1.5, 562500: 1.5, 600000: 1.5,
      675000: 1.5, 700000: 1.5, 787500: 1.5, 800000: 1.3, 900000: 1.3, 1000000: 1.3,
      1012500: 1.3, 1125000: 1.3, 1200000: 1.3, 1237500: 1.3, 1350000: 1.3, 1400000: 1.3,
      1462500: 1.3, 1575000: 1.3, 1600000: 1.3, 1687500: 1.3, 1800000: 1.3, 2000000: 1.3,
      2025000: 1.3, 2250000: 1.3, 3000000: 1.3, 4000000: 1.3, 5000000: 1.3, 6000000: 1.3,
      7000000: 1.2, 8000000: 1.2, 9000000: 1.2, 10000000: 1.2, 11000000: 1.2, 12000000: 1.2,
      13000000: 1.2, 14000000: 1.2, 15000000: 1.2, 16000000: 1.2, 18000000: 1.2,
    };

    const rangevalue = parseFloat(totalarea.toString());
    console.log("Total area:", totalarea);
    console.log("Range value:", rangevalue);
    const range = rangeData.find(
      (r) => rangevalue >= r.range1 && rangevalue <= r.range2
    );
    const key = range ? range.sqarea : null;
    console.log("Range found:", range);
    const sqcmRate = key ? sqcmRates[key as keyof typeof sqcmRates] : 0;
    return sqcmRate || 0;
  }, []);

  const getlayers = useCallback(
    (layers: number, sqCm: number, thickness: number, totalarea: number) => {
      if (layers === 1) {
        return getCostPerSqCmss(sqCm, thickness);
      } else if (layers === 2) {
        return getPcbCostds(sqCm, thickness);
      } else if (layers > 3) {
        return getCostofmm(layers, totalarea);
      } else {
        return null; // or return 0 or throw new Error("Invalid number of layers");
      }
    },
    [getCostofmm]
  );

  function getPcbCostds(sqCm: number, thickness: number) {
    // Data structure mapping thickness to price breakpoints
    const priceTable = {
      0.8: [
        [100, 2.95], [200, 2.95], [300, 2.95], [400, 2.95], [500, 2.95], [1000, 2.79], [2000, 2.72],
        [3000, 2.64], [4000, 2.56], [5000, 2.49], [6000, 2.41], [7000, 2.33], [8000, 2.26],
        [9000, 2.18], [10000, 2.18], [12000, 2.03], [14000, 2.03], [16000, 1.87], [18000, 1.57],
        [20000, 1.42], [25000, 1.26], [30000, 1.11], [35000, 0.96], [40000, 0.8], [45000, 0.65],
        [50000, 0.65], [55000, 0.64], [60000, 0.62], [65000, 0.6], [70000, 0.59], [75000, 0.59],
        [80000, 0.59], [85000, 0.59], [90000, 0.59], [95000, 0.57], [100000, 0.57],
      ],
      1.6: [
        [100, 3.24], [200, 3.24], [300, 3.24], [400, 3.24], [500, 3.24], [1000, 3.07], [2000, 2.99],
        [3000, 2.9], [4000, 2.82], [5000, 2.74], [6000, 2.65], [7000, 2.57], [8000, 2.48],
        [9000, 2.4], [10000, 2.4], [12000, 2.23], [14000, 2.23], [16000, 2.06], [18000, 1.73],
        [20000, 1.56], [25000, 1.39], [30000, 1.22], [35000, 1.05], [40000, 0.88], [45000, 0.72],
        [50000, 0.72], [55000, 0.7], [60000, 0.68], [65000, 0.66], [70000, 0.65], [75000, 0.65],
        [80000, 0.65], [85000, 0.65], [90000, 0.65], [95000, 0.63], [100000, 0.63],
      ],
      2.4: [
        [100, 3.57], [200, 3.57], [300, 3.57], [400, 3.57], [500, 3.57], [1000, 3.38], [2000, 3.29],
        [3000, 3.19], [4000, 3.1], [5000, 3.01], [6000, 2.92], [7000, 2.82], [8000, 2.73],
        [9000, 2.64], [10000, 2.64], [12000, 2.45], [14000, 2.45], [16000, 2.27], [18000, 1.9],
        [20000, 1.71], [25000, 1.53], [30000, 1.34], [35000, 1.16], [40000, 0.97], [45000, 0.79],
        [50000, 0.79], [55000, 0.77], [60000, 0.75], [65000, 0.73], [70000, 0.71], [75000, 0.71],
        [80000, 0.71], [85000, 0.71], [90000, 0.71], [95000, 0.69], [100000, 0.69],
      ],
      3.2: [
        [100, 3.92], [200, 3.92], [300, 3.92], [400, 3.92], [500, 3.92], [1000, 3.72], [2000, 3.62],
        [3000, 3.51], [4000, 3.41], [5000, 3.31], [6000, 3.21], [7000, 3.11], [8000, 3.0],
        [9000, 2.9], [10000, 2.9], [12000, 2.7], [14000, 2.7], [16000, 2.5], [18000, 2.09],
        [20000, 1.88], [25000, 1.68], [30000, 1.48], [35000, 1.27], [40000, 1.07], [45000, 0.87],
        [50000, 0.87], [55000, 0.85], [60000, 0.82], [65000, 0.8], [70000, 0.78], [75000, 0.78],
        [80000, 0.78], [85000, 0.78], [90000, 0.78], [95000, 0.76], [100000, 0.76],
      ],
    };

    const thicknessStr = thickness.toString() as "0.8" | "1.6" | "2.4" | "3.2";
    const breaks = priceTable[thicknessStr];

    if (!breaks) {
      throw new Error("Unsupported thickness value");
    }

    let pricePerSqCm = breaks[breaks.length - 1][1]; // default to last tier
    for (let i = 0; i < breaks.length; i++) {
      if (sqCm <= breaks[i][0]) {
        pricePerSqCm = breaks[i][1];
        break;
      }
    }

    return pricePerSqCm; // total cost
  }

  function getCostPerSqCmss(sqCm: number, thickness: number) {
    const pricing = {
      0.8: [
        [100, 1.15], [200, 1.15], [300, 1.15], [400, 1.15], [500, 1.15], [1000, 1.04], [2000, 1.0],
        [3000, 0.97], [4000, 0.92], [5000, 0.89], [6000, 0.85], [7000, 0.81], [8000, 0.77],
        [9000, 0.74], [10000, 0.63], [12000, 0.62], [14000, 0.61], [16000, 0.6], [18000, 0.59],
        [20000, 0.58], [25000, 0.56], [30000, 0.55], [35000, 0.54], [40000, 0.52], [45000, 0.51],
        [50000, 0.49], [55000, 0.48], [60000, 0.48], [65000, 0.47], [70000, 0.46], [75000, 0.46],
        [80000, 0.46], [85000, 0.46], [90000, 0.45], [95000, 0.45], [100000, 0.44],
      ],
      1.6: [
        [100, 1.15], [200, 1.15], [300, 1.15], [400, 1.15], [500, 1.15], [1000, 1.04], [2000, 1.0],
        [3000, 0.97], [4000, 0.92], [5000, 0.89], [6000, 0.85], [7000, 0.81], [8000, 0.77],
        [9000, 0.74], [10000, 0.63], [12000, 0.62], [14000, 0.61], [16000, 0.6], [18000, 0.59],
        [20000, 0.58], [25000, 0.56], [30000, 0.55], [35000, 0.54], [40000, 0.52], [45000, 0.51],
        [50000, 0.49], [55000, 0.48], [60000, 0.48], [65000, 0.47], [70000, 0.46], [75000, 0.46],
        [80000, 0.46], [85000, 0.46], [90000, 0.45], [95000, 0.45], [100000, 0.44],
      ],
      2.4: [
        [100, 1.27], [200, 1.27], [300, 1.27], [400, 1.27], [500, 1.27], [1000, 1.14], [2000, 1.1],
        [3000, 1.06], [4000, 1.01], [5000, 0.97], [6000, 0.94], [7000, 0.89], [8000, 0.85],
        [9000, 0.81], [10000, 0.7], [12000, 0.68], [14000, 0.67], [16000, 0.66], [18000, 0.65],
        [20000, 0.63], [25000, 0.62], [30000, 0.61], [35000, 0.59], [40000, 0.57], [45000, 0.56],
        [50000, 0.54], [55000, 0.53], [60000, 0.53], [65000, 0.52], [70000, 0.51], [75000, 0.51],
        [80000, 0.51], [85000, 0.51], [90000, 0.49], [95000, 0.49], [100000, 0.48],
      ],
      3.2: [
        [100, 1.39], [200, 1.39], [300, 1.39], [400, 1.39], [500, 1.39], [1000, 1.25], [2000, 1.21],
        [3000, 1.17], [4000, 1.11], [5000, 1.07], [6000, 1.03], [7000, 0.97], [8000, 0.93],
        [9000, 0.89], [10000, 0.77], [12000, 0.75], [14000, 0.74], [16000, 0.72], [18000, 0.71],
        [20000, 0.7], [25000, 0.68], [30000, 0.67], [35000, 0.65], [40000, 0.63], [45000, 0.61],
        [50000, 0.6], [55000, 0.58], [60000, 0.58], [65000, 0.57], [70000, 0.56], [75000, 0.56],
        [80000, 0.56], [85000, 0.56], [90000, 0.54], [95000, 0.54], [100000, 0.53],
      ],
    };

    const entries = pricing[thickness.toString() as "0.8" | "1.6" | "2.4" | "3.2"];
    if (!entries) throw new Error("Unsupported thickness");

    let rate = entries[entries.length - 1][1];
    for (let i = 0; i < entries.length; i++) {
      if (sqCm <= entries[i][0]) {
        rate = entries[i][1];
        break;
      }
    }

    return rate; // return up to 6 decimal places
  }

  const calculateMultiplelayers = useCallback(
    (layers: number, sqCm: number, thickness: number, totalarea: number) => {
      const baseofmultiplelayer = getlayers(layers, sqCm, thickness, totalarea);
      console.log("Base of multiple layer", baseofmultiplelayer);

      const pcbColor1 =
        { Green: 0, Purple: 0, Red: 0, Yellow: 0, Blue: 0 }[color] ?? 0;

      const silkScreen1 = { White: 0, Black: 0 }[silkscreen] ?? 0;

      const tg1 =
        {
          "Standard TG(130-140 C)": 0,
          "Mid TG (150 C) ": 0,
          "High TG (>=170 C)": 0.1,
        }[Tg] ?? 0;

      const surfaceFinish1 =
        { "HASL(with lead)": 0, "lead free HASL": 0.02, ENIG: 2 }[finish] ?? 0;

      const finishCopperThickness1 = { "18u": 0, "35u": 0, "70u": 0.1 }[copperWeight] ?? 0;

      const finishCopperThickness2 = { "18u": 0, "35u": 0.1, "70u": 0.15 }[copperWeight] ?? 0;

      const features1 = [
        pcbColor1,
        silkScreen1,
        tg1,
        surfaceFinish1,
        finishCopperThickness1,
        finishCopperThickness2,
      ];

      const featureSum1 = features1.reduce((total, value) => total + value, 0);
      console.log("FeatureSum1", featureSum1);

      const baseCost = (featureSum1 * (baseofmultiplelayer || 0)) + (baseofmultiplelayer || 0);

      return baseCost || 0;
    },
    [getlayers, color, silkscreen, Tg, finish, copperWeight]
  );

  const calculatePCBBaseCost = useCallback(
    (pcbDim: number, layers: number) => {
      const baseMaterial = thickness ? getlayers(layers, pcbDim, thickness, pcbDim) : 0;

      const pcbColor =
        { Green: 0, Purple: 0.5, Red: 0.5, Yellow: 0.5, Blue: 0.5 }[color] ?? 0;

      const silkScreen = { White: 0, Black: 0.01 }[silkscreen] ?? 0;

      const tg =
        {
          "Standard TG(130-140 C)": 0,
          "Mid TG (150 C) ": 1,
          "High TG (>=170 C)": 2,
        }[Tg] ?? 0;

      const surfaceFinish =
        { "HASL(with lead)": 0, "lead free HASL": 0.2, ENIG: 2 }[finish] ?? 0;

      const finishCopperThickness =
        { "18u": 0, "35u": 0.02, "70u": 0.4 }[copperWeight] ?? 0;

      const viaFill = { Yes: 0, No: 0.02 }[viaCovering] ?? 0;

      const thansivLogo = { Yes: 0, No: 0.005 }[viaSize] ?? 0;

      const removeOrderNumber = { Yes: 0, No: 0.005 }[Orederremove] ?? 0;

      const fpt = { Random: 0, "No test": 0.01, "Full test": 0.02 }[ftest] ?? 0;

      const goldFingers = { Yes: 0.7, No: 0 }[goldfinger] ?? 0;

      const features = [
        baseMaterial,
        pcbColor,
        silkScreen,
        tg,
        surfaceFinish,
        finishCopperThickness,
        viaFill,
        thansivLogo,
        removeOrderNumber,
        fpt,
        goldFingers,
      ];

      const featureSum = features.reduce((total, value) => (total || 0) + (value || 0), 0);
      const adjustedDimension = pcbDim * 1.15;

      return (featureSum || 0) * adjustedDimension;
    },
    [
      getlayers,
      color,
      silkscreen,
      Tg,
      finish,
      copperWeight,
      viaCovering,
      viaSize,
      Orederremove,
      ftest,
      goldfinger,
      thickness, // required for getlayers call
    ]
  );

  function shippingcost(totalarea: number, layers: number) {
    if (layers < 7) {
      return (totalarea * 0.33) / 1000;
    } else if (layers < 20) {
      return (totalarea * 0.41) / 1000;
    } else {
      return (totalarea * 0.51) / 1000;
    }
  }

  const calculateTotal = useCallback(() => {
    if (!pcbDimensions.width || !pcbDimensions.height || !quantity || !layers || !thickness) {
      return 0;
    }
    
    const width = parseFloat(pcbDimensions.width);
    const height = parseFloat(pcbDimensions.height);
    let pcbDim = parseFloat(((width * height) / 100).toFixed(2));
    let totalarea = pcbDim * quantity;
    let basecostofmm = calculateMultiplelayers(layers, pcbDim, thickness, totalarea);
    console.log("basecostofmm", basecostofmm);
    let developmentboard = getBoardPrice(layers);
    let basePrice = calculatePCBBaseCost(pcbDim, layers);
    let basecost = basePrice * quantity;

    let shipping = Math.ceil(shippingcost(totalarea, layers)) * 100;
    console.log("shipping", shipping);
    let totalprizeofmm = basecostofmm * totalarea + totalarea + shipping;
    let totalprize = basecost + (developmentboard || 0) + shipping;

    if (layers < 3) {
      return totalprize;
    } else {
      return totalprizeofmm;
    }
  }, [
    calculateMultiplelayers,
    calculatePCBBaseCost,
    pcbDimensions,
    quantity,
    layers,
    thickness,
  ]);

  const price = calculateTotal().toFixed(2);

  // Update fabrication status to 1 (visited) when price is calculated
  useEffect(() => {
    if (price && price !== "0.00" && username) {
      // Get current user ID
      const userData = localStorage.getItem("current_user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          AuthService.updateFabricationStatus(user.id, 1);
        } catch (error) {
          console.error("Failed to update fabrication status:", error);
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
      layers: !!layers,
      width: parseFloat(pcbDimensions.width) > 0,
      height: parseFloat(pcbDimensions.height) > 0,
      quantity: !!quantity,
      design: !!design,
      delivery: !!delivery,
      thickness: !!thickness,
      color: !!color,
      silkscreen: !!silkscreen,
      Tg: !!Tg,
      finish: !!finish,
      copperWeight: !!copperWeight,
      viaCovering: !!viaCovering,
      viaSize: !!viaSize,
      Orederremove: !!Orederremove,
      ftest: !!ftest,
      goldfinger: !!goldfinger,
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
      alert("⚠ Please upload your PCB design file before submitting.");
      return;
    }
    
    const quotationData = {
      username,
      order_type,
      order_id,
      File_Url: url,
      BaseMaterial: selectedMaterial,
      Layers: layers,
      Dimensions: `${pcbDimensions.width}mm x ${pcbDimensions.height}mm`,
      Quantity: `${quantity} pcs`,
      Designs: `${design} pcs`,
      Delivery: delivery,
      Thickness: `${thickness} mm`,
      Color: color,
      Silkscreen: silkscreen,
      TG: Tg,
      Finish: finish,
      CopperWeight: copperWeight,
      ViaCovering: viaCovering,
      MinViaSize: viaSize,
      OrederRemove: Orederremove,
      Ftest: ftest,
      GoldFinger: goldfinger,
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
          id: quotationData.order_id || `quotation-${Date.now()}`,
          name: `PCB Fabrication - ${quotationData.Layers} layers`,
          sku: `PCB-${quotationData.Layers}-${quotationData.Thickness}`,
          price: parseFloat(quotationData.price) || 0,
          image: quotationData.File_Url || "/placeholder-pcb.png",
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
        // console.log("cartItems", cartItems);
        // console.log(localStorage.getItem(cartKey));
        // console.log(localStorage.getItem("cart"));

        localStorage.setItem("price", quotationData.price);
        localStorage.setItem(cartKey, JSON.stringify(cartItems));
        localStorage.setItem("store", JSON.stringify(quotationData));

        // Update fabrication status to 2 (added to cart)
        AuthService.updateFabricationStatus(userId, 2);
      } catch (error) {
        console.error("Failed to save cart data:", error);
        alert("⚠ Failed to add item to cart. Please try again.");
        return;
      }
    }

    alert("✅ Quotation added to cart!");
    router.push("/cart");
    setUploadStatus("");
    setPcbImage({ top: "", bottom: "" });
    setFile(null);
    setLayers(null);
    setColor("");
    setCopperWeight("");
    setDelivery("");
    setThickness(undefined);
    reset();
  };

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

  const reset = () => {
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
          
          {pcbImage.top && pcbImage.bottom && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">PCB Preview</h3>
              <p className="text-gray-600 mb-3">
                Dimensions: {pcbDimensions.width} mm × {pcbDimensions.height} mm
              </p>
              <div className="flex justify-center bg-gray-100 p-3 rounded">
                <img 
                  src={pcbImage.top} 
                  alt="Top PCB Layer" 
                  className="max-h-64 object-contain border border-gray-300 rounded" 
                />
              </div>
            </div>
          )}

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <input
              type="file"
              accept=".gbr,.zip"
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
            <p className="mt-2 text-sm text-gray-500">Supports .gbr and .zip formats</p>
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
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">PCB Configuration</h3>
            
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
              <label className="block text-lg font-medium text-gray-700 mb-3">PCB Thickness (mm)</label>
              <div className="flex flex-wrap gap-3">
                {[0.8, 1.6, 2.4, 3.2].map((value) => (
                  <button
                    key={value}
                    className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                      thickness === value 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                    onClick={() => setThickness(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-700 mb-3">Layer Count</label>
              <div className="flex flex-wrap gap-3">
                {layerOptions.map((layer) => (
                  <button
                    key={layer}
                    className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                      layers === layer 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                    onClick={() => {
                      if (!thickness) {
                        alert("⚠ Please select PCB Thickness first.");
                        return;
                      }
                      setLayers(typeof layer === 'number' ? layer : null);
                    }}
                  >
                    {layer}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-700 mb-3">Dimensions (mm)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="width"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={pcbDimensions.width}
                  onChange={(e) =>
                    setPcbDimensions((prev) => ({
                      ...prev,
                      width: e.target.value,
                    }))
                  }
                  min="0"
                  step="0.1"
                />
                <span className="text-gray-500">×</span>
                <input
                  type="number"
                  name="height"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={pcbDimensions.height}
                  onChange={(e) =>
                    setPcbDimensions((prev) => ({
                      ...prev,
                      height: e.target.value,
                    }))
                  }
                  min="0"
                  step="0.1"
                />
                <span className="text-gray-500 text-sm">mm</span>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-700 mb-3">Quantity</label>
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
              <label className="block text-lg font-medium text-gray-700 mb-3">Different Designs</label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={design}
                onChange={(e) => setDesign(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((d) => (
                  <option key={d} value={d}>
                    {d} design{d > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* PCB Specifications Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">PCB Specifications</h3>
              
              {/* Delivery Format */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">Delivery Format</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {["Single PCB", "Panel by Customer", "Panel by Glonix"].map((option) => (
                    <button
                      key={option}
                      className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                        delivery === option 
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                      onClick={() => setDelivery(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* PCB Color */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">PCB Color</label>
                <div className="flex flex-wrap gap-3">
                  {["Green", "Purple", "Red", "Yellow", "Blue"].map((col) => (
                    <button
                      key={col}
                      className={`py-2 px-4 rounded-md border transition-colors duration-200 relative overflow-hidden ${
                        color === col 
                          ? 'ring-2 ring-blue-500 ring-offset-2 font-medium' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setColor(col)}
                    >
                      <span className="relative z-10">{col}</span>
                      <span 
                        className={`absolute inset-0 opacity-20 ${col.toLowerCase()}-bg`}
                        style={{
                          backgroundColor: 
                            col === 'Green' ? '#4CAF50' :
                            col === 'Purple' ? '#9C27B0' :
                            col === 'Red' ? '#F44336' :
                            col === 'Yellow' ? '#FFEB3B' :
                            '#2196F3'
                        }}
                      ></span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Silkscreen */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">Silkscreen Color</label>
                <div className="flex flex-wrap gap-3">
                  {["White", "Black"].map((val) => (
                    <button
                      key={val}
                      className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                        silkscreen === val 
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                      onClick={() => setSilkscreen(val)}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* TG */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">TG Rating</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    "Standard TG(130-140 C)",
                    "Mid TG (150 C)",
                    "High TG (>=170 C)",
                  ].map((Tg1) => (
                    <button
                      key={Tg1}
                      className={`py-2 px-4 rounded-md border transition-colors duration-200 text-left ${
                        Tg === Tg1 
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                      onClick={() => setTg(Tg1)}
                    >
                      {Tg1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Surface Finish */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">Surface Finish</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {["HASL(with lead)", "lead free HASL", "ENIG"].map((fin) => (
                    <button
                      key={fin}
                      className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                        finish === fin 
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                      onClick={() => setFinish(fin)}
                    >
                      {fin}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* High-spec Options Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Advanced Options</h3>
              
              {/* Copper Thickness */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">Copper Thickness (oz)</label>
                <div className="flex flex-wrap gap-3">
                  {["18u", "35u", "70u"].map((weight) => (
                    <button
                      key={weight}
                      className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                        copperWeight === weight 
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                      onClick={() => setCopperWeight(weight)}
                    >
                      {weight}
                    </button>
                  ))}
                </div>
              </div>

              {/* Via Fill */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">Via Fill</label>
                <div className="flex flex-wrap gap-3">
                  {["Yes", "No"].map((val) => (
                    <button
                      key={val}
                      className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                        viaCovering === val 
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                      onClick={() => setViaCovering(val)}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gold Finger */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">Gold Finger Plating</label>
                <div className="flex flex-wrap gap-3">
                  {["Yes", "No"].map((rem) => (
                    <button
                      key={rem}
                      className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                        goldfinger === rem 
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                      onClick={() => setGoldfinger(rem)}
                    >
                      {rem}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min Via Size */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">Min Via Size</label>
                <div className="flex flex-wrap gap-3">
                  {["0.2mm", "0.25mm", "0.3mm"].map((size) => (
                    <button
                      key={size}
                      className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                        viaSize === size 
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                      onClick={() => setViaSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">Remove Order Number</label>
                  <div className="flex flex-wrap gap-3">
                    {["Yes", "No"].map((rem) => (
                      <button
                        key={rem}
                        className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                          Orederremove === rem 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                        onClick={() => setOrderremove(rem)}
                      >
                        {rem}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">Flying Probe Test</label>
                  <div className="flex flex-wrap gap-3">
                    {["Random", "No test", "Full test"].map((test) => (
                      <button
                        key={test}
                        className={`py-2 px-4 rounded-md border transition-colors duration-200 ${
                          ftest === test 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                        onClick={() => setFtest(test)}
                      >
                        {test}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96 bg-white rounded-lg shadow-md p-6 h-fit sticky top-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Thickness:</span>
                <span className="font-medium">{thickness || '--'} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Layers:</span>
                <span className="font-medium">{layers || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dimensions:</span>
                <span className="font-medium">
                  {pcbDimensions.width ? `${pcbDimensions.width} × ${pcbDimensions.height} mm` : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{quantity} pcs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Material:</span>
                <span className="font-medium">{selectedMaterial || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Color:</span>
                <span className="font-medium">{color || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Surface Finish:</span>
                <span className="font-medium">{finish || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Copper Weight:</span>
                <span className="font-medium">{copperWeight || '--'}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between text-lg font-semibold">
                <span>Estimated Price:</span>
                <span className="text-blue-600">INR {calculateTotal().toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Final price may vary after file review</p>
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
              <p className="text-sm text-blue-700">Our PCB experts are available 24/7 to assist with your order.</p>
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