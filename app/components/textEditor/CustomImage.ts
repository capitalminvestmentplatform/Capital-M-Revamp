import { Node, mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        renderHTML: (attributes) => {
          return {
            style: `width: ${attributes.width}; display: block; margin: 0 auto;`,
          };
        },
      },
      align: {
        default: "center", // default alignment
        parseHTML: (element) => element.getAttribute("data-align") || "center",
        renderHTML: (attributes) => {
          return {
            "data-align": attributes.align,
            style: `text-align: ${attributes.align}; display: block;`,
          };
        },
      },
    };
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos }) => {
      const wrapper = document.createElement("span");
      wrapper.style.display = "block"; // block wrapper
      wrapper.style.textAlign = node.attrs.align || "center";
      wrapper.style.position = "relative"; // needed for absolute resize handle

      const img = document.createElement("img");
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || "";
      img.style.width = node.attrs.width || "100%";
      img.style.display = "inline-block";
      img.style.height = "auto"; // shorthand for centering horizontally

      const handle = document.createElement("span");
      handle.style.position = "absolute";
      handle.style.width = "10px";
      handle.style.height = "10px";
      handle.style.background = "#aaa";
      handle.style.cursor = "nwse-resize";
      handle.style.borderRadius = "2px";
      handle.style.bottom = "0";
      //   handle.style.right = "0";
      handle.style.transform = "translateX(-50%) translateY(50%)";

      //   const container = document.createElement("div");
      //   container.style.display = "inline-block";
      //   container.style.position = "relative";

      // Add mouse drag logic
      let startX = 0;
      let startWidth = 0;

      handle.addEventListener("mousedown", (event) => {
        event.preventDefault();
        startX = event.clientX;
        startWidth = img.offsetWidth;

        const onMouseMove = (moveEvent: MouseEvent) => {
          const newWidth = startWidth + (moveEvent.clientX - startX);
          img.style.width = `${newWidth}px`;
        };

        const onMouseUp = () => {
          const pos = getPos();
          if (typeof pos === "number") {
            this.editor.commands.command(({ tr }) => {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                width: img.style.width,
              });
              return true;
            });
          }
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      });

      wrapper.appendChild(img);
      wrapper.appendChild(handle);
      //   wrapper.appendChild(container);

      return {
        dom: wrapper,
        contentDOM: null,
      };
    };
  },
});
