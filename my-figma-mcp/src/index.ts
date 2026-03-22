import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
if (!FIGMA_TOKEN) {
  console.error("Error: FIGMA_TOKEN 환경변수가 설정되지 않았습니다.");
  process.exit(1);
}

const figma = axios.create({
  baseURL: "https://api.figma.com/v1",
  headers: { "X-Figma-Token": FIGMA_TOKEN },
});

const server = new McpServer({
  name: "my-figma-mcp",
  version: "1.0.0",
});

// 파일 내 모든 컴포넌트 목록 가져오기
server.tool(
  "get_components",
  "Figma 파일의 모든 컴포넌트와 속성을 가져옵니다 (디자인 시스템 학습용)",
  { fileKey: z.string().describe("Figma 파일 URL의 fileKey") },
  async ({ fileKey }) => {
    const { data } = await figma.get(`/files/${fileKey}/components`);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// 디자인 토큰(변수) 가져오기
server.tool(
  "get_variables",
  "Figma 파일의 로컬 변수(색상, 타이포그래피, 간격 토큰 등)를 가져옵니다",
  { fileKey: z.string().describe("Figma 파일 URL의 fileKey") },
  async ({ fileKey }) => {
    const { data } = await figma.get(`/files/${fileKey}/variables/local`);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// 색상/텍스트 스타일 가져오기
server.tool(
  "get_styles",
  "Figma 파일의 색상, 텍스트, 이펙트 스타일을 가져옵니다",
  { fileKey: z.string().describe("Figma 파일 URL의 fileKey") },
  async ({ fileKey }) => {
    const { data } = await figma.get(`/files/${fileKey}/styles`);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// 특정 노드 상세 정보
server.tool(
  "get_node",
  "특정 노드(프레임, 컴포넌트 등)의 상세 구조를 가져옵니다",
  {
    fileKey: z.string().describe("Figma 파일 URL의 fileKey"),
    nodeId: z.string().describe("노드 ID (URL의 node-id 파라미터)"),
  },
  async ({ fileKey, nodeId }) => {
    const { data } = await figma.get(`/files/${fileKey}/nodes?ids=${nodeId}`);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// 파일 내 프레임 목록 (페이지 구조 파악용)
server.tool(
  "list_frames",
  "Figma 파일의 모든 페이지와 프레임 목록을 가져옵니다",
  { fileKey: z.string().describe("Figma 파일 URL의 fileKey") },
  async ({ fileKey }) => {
    const { data } = await figma.get(`/files/${fileKey}`);
    const pages = data.document.children.map((page: any) => ({
      id: page.id,
      name: page.name,
      frames: (page.children ?? [])
        .filter((n: any) => n.type === "FRAME" || n.type === "COMPONENT")
        .map((f: any) => ({ id: f.id, name: f.name, type: f.type })),
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(pages, null, 2) }],
    };
  }
);

// 컴포넌트 세트(variants) 가져오기
server.tool(
  "get_component_sets",
  "Figma 파일의 컴포넌트 세트(variants)를 가져옵니다",
  { fileKey: z.string().describe("Figma 파일 URL의 fileKey") },
  async ({ fileKey }) => {
    const { data } = await figma.get(`/files/${fileKey}/component_sets`);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// 노드 이미지 추출
server.tool(
  "get_image",
  "특정 노드를 이미지(PNG/SVG)로 내보냅니다",
  {
    fileKey: z.string().describe("Figma 파일 URL의 fileKey"),
    nodeId: z.string().describe("노드 ID"),
    format: z.enum(["png", "svg", "jpg"]).default("png").describe("이미지 형식"),
    scale: z.number().min(0.5).max(4).default(2).describe("배율 (1~4)"),
  },
  async ({ fileKey, nodeId, format, scale }) => {
    const { data } = await figma.get(
      `/images/${fileKey}?ids=${nodeId}&format=${format}&scale=${scale}`
    );
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
