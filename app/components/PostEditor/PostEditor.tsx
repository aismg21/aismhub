"use client";

import React, { useEffect, useRef, useState } from "react";
import { getStorage, ref, uploadString } from "firebase/storage";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import styles from "./PostEditor.module.css";

interface PostEditorProps {
  userId: string;
  templateUrl: string;
}

// Custom fonts placed in /public/fonts (names should match filenames without extension)
const CUSTOM_FONTS = ["ZINCOBC", "Rage", "MTCORSVA"];

// System fonts to show in dropdown
const SYSTEM_FONTS = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Roboto",
  "Poppins",
  "Montserrat",
];

const MAX_DAILY_DOWNLOADS = 2;
const TEMPLATE_SIZE = 1000; // Base size for scaling

const PostEditor: React.FC<PostEditorProps> = ({ userId, templateUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isInitialized = useRef(false);
  const [canvas, setCanvas] = useState<any>(null);

  const [fontOptions, setFontOptions] = useState<string[]>([
    ...SYSTEM_FONTS,
    ...CUSTOM_FONTS,
  ]);

  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState<string>(
    (SYSTEM_FONTS[0] || "Arial")
  );

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const phoneGroupRef = useRef<any>(null);
  const messageTextRef = useRef<any>(null);
  const socialIconsRef = useRef<any[]>([]);

  // --- Utility: preload a font (if not already loaded) ---
  const loadFontIfNeeded = async (fontName: string) => {
    try {
      // document.fonts.check returns true if available
      if ((document as any).fonts && (document as any).fonts.check) {
        if ((document as any).fonts.check(`1em ${fontName}`)) {
          return;
        }
      }
      // Try .ttf then .otf (compat)
      const ttfUrl = `/fonts/${fontName}.ttf`;
      const otfUrl = `/fonts/${fontName}.otf`;

      // Prefer ttf; if it fails, let the catch handle fallback
      const fontFace = new FontFace(fontName, `url(${ttfUrl})`);
      const loaded = await fontFace.load();
      (document as any).fonts.add(loaded);
    } catch (err) {
      // swallow error (font file may not exist). This is okay.
      // console.warn(`Font load failed for ${fontName}`, err);
    }
  };

  // Preload our CUSTOM_FONTS on mount (helps first-time usage)
  useEffect(() => {
    (async () => {
      try {
        await Promise.all(CUSTOM_FONTS.map((f) => loadFontIfNeeded(f)));
      } catch (e) {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCanvasSize = () => {
    if (typeof window === "undefined") return { w: 800, h: 800 };
    if (window.innerWidth < 450) return { w: 300, h: 300 };
    if (window.innerWidth < 768) return { w: 500, h: 500 };
    return { w: 800, h: 800 };
  };

  // -------------------- Initialize Canvas --------------------
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    if (!canvasRef.current) return;

    import("fabric").then(async (fabric) => {
      const { Canvas, Image, Textbox, Group } = fabric;
      const size = getCanvasSize();
      const c = new Canvas(canvasRef.current!, {
        width: size.w,
        height: size.h,
        backgroundColor: "#fff",
      });
      setCanvas(c);

      const scaleFactor = c.getWidth() / TEMPLATE_SIZE;

      // ---------------- Load template background ----------------
      if (templateUrl) {
        Image.fromURL(templateUrl, { crossOrigin: "anonymous" }).then((img: any) => {
          img.scaleToWidth(c.getWidth());
          img.selectable = false;
          c.backgroundImage = img;
          c.renderAll();
        });
      }

      // ---------------- Fetch user profile ----------------
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const data = userDoc.data();

          // ---------- PHONE NUMBER LAYER ----------
          if (data.phoneNumber) {
            Image.fromURL("/icons/phone.png", { crossOrigin: "anonymous" }).then((icon: any) => {
              const phoneText = new Textbox(data.phoneNumber, {
                fontSize: 30 * scaleFactor,
                fill: "#000",
                textAlign: "left",
                fontFamily: "Arial",
                fontWeight: "bold",
                stroke: "#fff",
                strokeWidth: 2,
                paintFirst: "stroke",
                left: 40 * scaleFactor,
                top: 0,
                selectable: false,
              });

              const group = new Group([icon, phoneText], {
                left: 20 * scaleFactor,
                top: c.getHeight() - 50 * scaleFactor,
                selectable: true,
                hasControls: true,
              });
              (group as any).phoneLayer = true;
              phoneGroupRef.current = group;

              icon.scaleToWidth(35 * scaleFactor);

              c.add(group);
              c.renderAll();
            });
          }

          // ---------- SOCIAL ICONS ----------
          if (data.socialLinks) {
            socialIconsRef.current = [];
            const yOffset = 20 * scaleFactor;
            let xOffset = c.getWidth() - 20 * scaleFactor;

            Object.entries(data.socialLinks).forEach(([key, link]) => {
              if (!link) return;

              const iconPath = `/icons/${key}.png`;
              Image.fromURL(iconPath, { crossOrigin: "anonymous" }).then((icon: any) => {
                const iconSize = 30 * scaleFactor;
                icon.set({
                  left: xOffset - iconSize,
                  top: yOffset,
                  selectable: false,
                  hasControls: false,
                });
                icon.scaleToWidth(iconSize);
                icon.isSocialIcon = true;
                socialIconsRef.current.push(icon);

                c.add(icon);
                c.renderAll();
                xOffset -= iconSize + 10 * scaleFactor;
              });
            });
          }

          // ---------- MESSAGE TEXT (BOTTOM-RIGHT) ----------
          if (data.messageText) {
            const messageBox = new Textbox(data.messageText, {
              left: c.getWidth() - 20 * scaleFactor,
              top: c.getHeight() - 25 * scaleFactor,
              fontSize: 25 * scaleFactor,
              fill: "#000",
              fontFamily: "Arial",
              fontWeight: "600",
              textAlign: "right",
              stroke: "#fff",
              strokeWidth: 2,
              paintFirst: "stroke",
              editable: true,
              originX: "right",
              originY: "bottom",
            });
            (messageBox as any).messageLayer = true;
            messageTextRef.current = messageBox;

            c.add(messageBox);
            c.renderAll();
          }
        }
      } catch (err) {
        // ignore user fetch error
      }

      // ---------------- Resize Listener ----------------
      const resizeListener = () => {
        const size = getCanvasSize();
        c.setWidth(size.w);
        c.setHeight(size.h);

        const scaleFactor = c.getWidth() / TEMPLATE_SIZE;

        // Resize background
        if (c.backgroundImage) {
          c.backgroundImage.scaleToWidth(c.getWidth());
        }

        // Resize phone layer
        if (phoneGroupRef.current) {
          const group = phoneGroupRef.current;
          group.scale(scaleFactor);
          group.left = 20 * scaleFactor;
          group.top = c.getHeight() - 50 * scaleFactor;
          const phoneText = group.item(1);
          phoneText.fontSize = 30 * scaleFactor;
          const icon = group.item(0);
          icon.scaleToWidth(35 * scaleFactor);
        }

        // Resize message text
        if (messageTextRef.current) {
          const msg = messageTextRef.current;
          msg.set({
            left: c.getWidth() - 20 * scaleFactor,
            top: c.getHeight() - 50 * scaleFactor,
            fontSize: 25 * scaleFactor,
            originX: "right",
            originY: "bottom",
            textAlign: "right",
          });
          msg.setCoords();
        }

        // Resize social icons
        if (socialIconsRef.current.length) {
          let xOffset = c.getWidth() - 20 * scaleFactor;
          socialIconsRef.current.forEach((icon: any) => {
            const iconSize = 30 * scaleFactor;
            icon.set({
              left: xOffset - iconSize,
              top: 20 * scaleFactor,
            });
            icon.scaleToWidth(iconSize);
            xOffset -= iconSize + 10 * scaleFactor;
          });
        }

        // Resize uploaded images proportionally
        c.getObjects().forEach((obj: any) => {
          if (!obj.phoneLayer && !obj.messageLayer && !obj.isSocialIcon && obj.type === "image") {
            const ratio = obj.width! / TEMPLATE_SIZE;
            obj.scaleToWidth(c.getWidth() * ratio);
          }
        });

        c.renderAll();
      };

      window.addEventListener("resize", resizeListener);
      return () => {
        window.removeEventListener("resize", resizeListener);
        c.dispose();
      };
    });
  }, [templateUrl, userId]);

  // -------------------- Add Text --------------------
  const handleAddText = async () => {
    if (!canvas) return;
    const { Textbox } = await import("fabric");

    // preload selected font if custom
    await loadFontIfNeeded(fontFamily);

    const textbox = new Textbox("New Text", {
      left: 50,
      top: 50,
      fontSize,
      fill: textColor,
      fontFamily,
    });
    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    // ensure it's rendered properly
    textbox.set("dirty", true);
    textbox.setCoords();
    canvas.requestRenderAll?.() ?? canvas.renderAll();
  };

  // -------------------- Delete Text --------------------
  const handleDelete = () => {
    const active = canvas?.getActiveObject();
    if (active && !(active as any).phoneLayer && !(active as any).messageLayer) {
      canvas.remove(active);
      canvas.renderAll();
    }
  };

  // -------------------- Upload Image --------------------
  const handleImageUpload = (e: any) => {
    if (!canvas) return;
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (f: any) => {
      const { Image } = await import("fabric");
      Image.fromURL(f.target.result).then((img: any) => {
        img.scaleToWidth(canvas.getWidth() / 2);
        canvas.add(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  // -------------------- Save --------------------
  const handleSave = async () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL("image/png");
    const storage = getStorage();
    const storageRef = ref(storage, `posts/${userId}_${Date.now()}.png`);
    await uploadString(storageRef, dataURL, "data_url");
    alert("Post Saved Successfully!");
  };

  // -------------------- Download --------------------
  const handleDownloadJPG = async (postId: string = "post1") => {
    if (!canvas) return;

    const downloadsRef = collection(db, "users", userId, "downloads");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const q = query(downloadsRef, where("timestamp", ">=", today));
    const snapshot = await getDocs(q);

    if (snapshot.size >= MAX_DAILY_DOWNLOADS) {
      setPopupMessage(`आप आज ${MAX_DAILY_DOWNLOADS} पोस्ट डाउनलोड कर चुके हैं.\nअधिक डाउनलोड के लिए कल कोशिश करें।`);
      setShowPopup(true);
      return;
    }

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = TEMPLATE_SIZE;
    exportCanvas.height = TEMPLATE_SIZE;
    const exportCtx = exportCanvas.getContext("2d");

    const dataURL = canvas.toDataURL({ format: "png", multiplier: TEMPLATE_SIZE / canvas.getWidth() });
    const img = new Image();
    img.src = dataURL;

    img.onload = async () => {
      exportCtx?.drawImage(img, 0, 0, TEMPLATE_SIZE, TEMPLATE_SIZE);
      const link = document.createElement("a");
      link.href = exportCanvas.toDataURL("image/jpeg", 1.0);
      link.download = "poster.jpg";
      link.click();
      await addDoc(downloadsRef, { postId, timestamp: serverTimestamp() });
    };
  };

  // -------------------- Text Styling --------------------
  const applyStyle = async (style: string) => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.type !== "textbox" || (active as any).phoneLayer || (active as any).messageLayer) return;

    if (style === "bold")
      active.set("fontWeight", active.fontWeight === "bold" ? "normal" : "bold");
    if (style === "italic")
      active.set("fontStyle", active.fontStyle === "italic" ? "normal" : "italic");
    if (style === "underline")
      active.set("underline", !active.underline);

    // force refresh
    active.set("dirty", true);
    active.setCoords();
    canvas.requestRenderAll?.() ?? canvas.renderAll();
  };

  const applyTextProps = async () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.type !== "textbox" || (active as any).phoneLayer || (active as any).messageLayer) return;

    // preload font before applying (if custom)
    await loadFontIfNeeded(fontFamily);

    active.set({
      fill: textColor,
      fontSize,
      fontFamily,
    });

    // force refresh so change appears immediately
    active.set("dirty", true);
    active.setCoords();
    canvas.requestRenderAll?.() ?? canvas.renderAll();
  };

  // -------------------- Align --------------------
  const applyAlign = (align: "left" | "center" | "right") => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.type !== "textbox") return;
    active.set("textAlign", align);
    active.set("dirty", true);
    active.setCoords();
    canvas.requestRenderAll?.() ?? canvas.renderAll();
  };

  // -------------------- Handle font select change (immediate effect) ----
  const handleFontSelect = async (font: string) => {
    setFontFamily(font);
    await loadFontIfNeeded(font);

    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.type !== "textbox") return;

    active.set("fontFamily", font);
    active.set("dirty", true);
    active.setCoords();
    canvas.requestRenderAll?.() ?? canvas.renderAll();
  };

  return (
    <div className={styles.container}>
      {/* TOP TOOLBAR */}
      <div className={styles.topToolbar}>
        <div className={styles.leftGroup}>
          <button className={styles.button} onClick={handleAddText}>Add Text</button>
          <button className={styles.button} onClick={() => applyStyle("bold")}>B</button>
          <button className={styles.button} onClick={() => applyStyle("italic")}>I</button>
          <button className={styles.button} onClick={() => applyStyle("underline")}>U</button>

          {/* ALIGN */}
          <button className={styles.button} onClick={() => applyAlign("left")}>Left</button>
          <button className={styles.button} onClick={() => applyAlign("center")}>Center</button>
          <button className={styles.button} onClick={() => applyAlign("right")}>Right</button>

          <input
            type="color"
            className={styles.colorInput}
            value={textColor}
            onChange={(e) => {
              setTextColor(e.target.value);
              applyTextProps();
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "180px" }}>
            <input
              type="range"
              min={10}
              max={150}
              value={fontSize}
              onChange={(e) => {
                setFontSize(Number(e.target.value));
                applyTextProps();
              }}
              style={{ width: "120px" }}
            />
            <input
              type="number"
              min={10}
              max={150}
              value={fontSize}
              onChange={(e) => {
                setFontSize(Number(e.target.value));
                applyTextProps();
              }}
              className={styles.numberInput}
              style={{ width: "50px" }}
            />
          </div>

          {/* FONT SELECT */}
          <select
            className={styles.selectInput}
            value={fontFamily}
            onChange={(e) => handleFontSelect(e.target.value)}
          >
            {fontOptions.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.rightGroup}>
          <label className={styles.button}>
            Upload
            <input type="file" style={{ display: "none" }} accept="image/*" onChange={handleImageUpload} />
          </label>
          <button className={styles.button} onClick={handleDelete}>Delete</button>
          <button className={styles.button} onClick={handleSave}>Save</button>
        </div>
      </div>

      {/* CANVAS */}
      <div className={styles.canvasWrapper}><canvas ref={canvasRef} /></div>

      {/* BOTTOM TOOLBAR */}
      <div className={styles.bottomToolbar}>
        <button className={styles.button} onClick={() => handleDownloadJPG("post1")}>Download JPG</button>
      </div>

      {/* POPUP */}
      {showPopup && (
        <div style={{ position: "fixed", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.5)", zIndex: 9999 }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 10, textAlign: "center", whiteSpace: "pre-line" }}>
            {popupMessage}
            <br />
            <button style={{ marginTop: 15, padding: "6px 12px" }} onClick={() => setShowPopup(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostEditor;
