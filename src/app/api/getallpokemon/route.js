import { NextResponse } from "next/server";
import connect from "@/utils/db";
import Pokemon from "@/models/Pokemon";

export const GET = async (request) => {
    try {
        await connect();

        const pokemon = await Pokemon.find();

        return new NextResponse(pokemon, {status: 200})

    } catch (err) {
        return new NextResponse("Database Errorm", {status: 500})
    }
}