import { getAnamneses } from "@/actions/get-anamneses";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const result = await getAnamneses({
      search: searchParams.get("search") || "",
      page: Number(searchParams.get("page")) || 1,
      orderBy: searchParams.get("orderBy") || "id",
      order: (searchParams.get("order") as "asc" | "desc") || "asc",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    });
    
    if (result.error) {
      return Response.json(
        { error: result.error }, 
        { status: 400 }
      );
    }
    
    return Response.json(result.data);
  } catch (error) {
    console.error("API Error:", error);
    return Response.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    );
  }
}