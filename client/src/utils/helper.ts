import moment from 'moment'
import html2canvas from "html2canvas";

export const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// get lightest average color
export const getLightColorFromImage = (imageUrl: string) => {
  return new Promise((resolve, reject) => {
    // Check if imageUrl is valid
    if (!imageUrl || typeof imageUrl !== 'string') {
      return reject(new Error('Invalid image URL'));
    }

    const img = new Image();

    // If not a base64 string, set crossOrigin (important for CORS)
    if (!imageUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }

    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      let r = 0, g = 0, b = 0, count = 0;

      for (let i = 0; i < imageData.length; i += 4) {
        const red = imageData[i];
        const green = imageData[i + 1];
        const blue = imageData[i + 2];
        const brightness = (red + green + blue) / 3;

        // Only count light pixels (tweak threshold as needed)
        if (brightness > 180) {
          r += red;
          g += green;
          b += blue;
          count++;
        }
      }

      if (count === 0) {
        resolve('#ffffff'); // fallback if no bright pixels found
      } else {
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        resolve(`rgb(${r}, ${g}, ${b})`);
      }
    };

    img.onerror = (e) => {
      console.error('❌ Failed to load image:', e);
      reject(new Error('Image could not be loaded or is blocked by CORS.'));
    };
  });
};

// Eg: Mar 2025
export function formatYearMonth(yearMonth: string | null): string {
    return yearMonth ? moment(yearMonth, "YYYY-MM").format("MMM YYYY") : "";
}

interface StyleElement extends HTMLElement {
    style: CSSStyleDeclaration;
}

interface StyleProperties {
    color: string;
    backgroundColor: string;
    borderColor: string;
}

export const fixTailwindColors = (element: HTMLElement): void => {
    const elements: NodeListOf<StyleElement> = element.querySelectorAll("*");

    elements.forEach((el: StyleElement) => {
        const style: CSSStyleDeclaration = window.getComputedStyle(el);

        (["color", "backgroundColor", "borderColor"] as Array<keyof StyleProperties>).forEach((prop) => {
            const value: string = style[prop];
            if (value.includes("oklch")) {
                el.style[prop] = "#000"; // or any safe fallback
            }
        });
    });
};

// convert component to image
export async function captureElementAsImage(element: HTMLElement): Promise<string> {
    if (!element) throw new Error("No element provided");

    const canvas = await html2canvas(element);
    return canvas.toDataURL("image/png");
}

// Utility to convert base64 data URL to a File object
export const dataURLtoFile = (dataUrl: string, fileName: string): File => {
    const arr: string[] = dataUrl.split(",");
    const mime: string = arr[0].match(/:(.*?);/)![1];
    const bstr: string = atob(arr[1]);
    let n: number = bstr.length;
    const u8arr: Uint8Array = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, { type: mime });
};