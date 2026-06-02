import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui_d/button";
import { Input } from "./ui_d/input";
import { Textarea } from "./ui_d/textarea";
import { createCountryEnquiry, type CountryEnquiryForm } from "../lib/api";

const enquirySchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required"),
    teamSize: z.number().min(10, "Minimum team size is 10"),  // ← z.number() not z.coerce.number()
    date: z.string().min(1, "Date is required"),
    note: z.string().optional(),
});

type EnquiryFormValues = z.infer<typeof enquirySchema>;

interface CorporateBookingFormProps {
    title?: string;
}

export function CorporateBookingForm({
    title = "Plan a team trip you'll actually like",
}: CorporateBookingFormProps) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const form = useForm<EnquiryFormValues>({
        resolver: zodResolver(enquirySchema),
        defaultValues: {
            name: "",
            email: "",
            teamSize: 10,
            date: "",
            note: "",
        },
    });

    const onSubmit = async (data: EnquiryFormValues) => {
        setStatus("loading");
        setErrorMsg("");
        try {
            await createCountryEnquiry(data as CountryEnquiryForm);
            setStatus("success");
            form.reset();
        } catch (err: any) {
            setErrorMsg(err?.message || "Something went wrong. Please try again.");
            setStatus("error");
        }
    };

    return (
        <div className="w-full max-w-[340px] ml-auto">
            <div className="bg-black/20 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl">
                <h3 className="text-2xl font-serif text-white mb-6 font-semibold drop-shadow-md">
                    {title}
                </h3>

                {status === "success" ? (
                    <div className="text-white text-center py-8 space-y-2">
                        <p className="text-2xl">🎉</p>
                        <p className="font-semibold text-lg">We've got your request!</p>
                        <p className="text-white/70 text-sm">Our team will reach out shortly with a proposal.</p>
                    </div>
                ) : (
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-semibold text-white/80 uppercase tracking-wider drop-shadow-sm">Name</label>
                            <Input
                                placeholder="John Doe"
                                className="bg-transparent border-white/40 text-white placeholder:text-white/50 h-10 backdrop-blur-sm focus:border-white focus:ring-white"
                                {...form.register("name")}
                            />
                            {form.formState.errors.name && (
                                <p className="text-red-300 text-xs">{form.formState.errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-semibold text-white/80 uppercase tracking-wider drop-shadow-sm">Work Email</label>
                            <Input
                                placeholder="john@company.com"
                                type="email"
                                className="bg-transparent border-white/40 text-white placeholder:text-white/50 h-10 backdrop-blur-sm focus:border-white focus:ring-white"
                                {...form.register("email")}
                            />
                            {form.formState.errors.email && (
                                <p className="text-red-300 text-xs">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-white/80 uppercase tracking-wider drop-shadow-sm">Team Size</label>
                                <Input
                                    placeholder="Min 10"
                                    type="number"
                                    min={10}
                                    className="bg-transparent border-white/40 text-white placeholder:text-white/50 h-10 backdrop-blur-sm focus:border-white focus:ring-white"
                                    {...form.register("teamSize",{ valueAsNumber: true })} 
                                />
                                {form.formState.errors.teamSize && (
                                    <p className="text-red-300 text-xs">{form.formState.errors.teamSize.message}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-white/80 uppercase tracking-wider drop-shadow-sm">Date</label>
                                <Input
                                    placeholder="mm/yyyy"
                                    className="bg-transparent border-white/40 text-white placeholder:text-white/50 h-10 backdrop-blur-sm focus:border-white focus:ring-white"
                                    {...form.register("date")}
                                />
                                {form.formState.errors.date && (
                                    <p className="text-red-300 text-xs">{form.formState.errors.date.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-semibold text-white/80 uppercase tracking-wider drop-shadow-sm">Note</label>
                            <Textarea
                                placeholder="Optional message"
                                className="bg-transparent border-white/40 text-white placeholder:text-white/50 resize-none h-16 backdrop-blur-sm focus:border-white focus:ring-white"
                                {...form.register("note")}
                            />
                        </div>

                        {status === "error" && (
                            <p className="text-red-300 text-xs text-center">{errorMsg}</p>
                        )}

                        <Button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full bg-[#e35d29] hover:bg-[#c94e1e] text-white rounded-full h-11 text-base font-semibold shadow-lg mt-2 disabled:opacity-60"
                        >
                            {status === "loading" ? "Sending…" : "Get a proposal"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}