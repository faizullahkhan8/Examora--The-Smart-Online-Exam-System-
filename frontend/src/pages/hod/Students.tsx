import { GraduationCap } from "lucide-react";

const Students = () => (
    <div className="p-8 pb-32 max-w-[1200px] mx-auto w-full font-sans">
        <h1 className="text-2xl font-black text-slate-900 mb-8">Students</h1>
        <div className="p-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white">
            <GraduationCap size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="font-black text-slate-500 mb-2">Coming Soon</h3>
            <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto">
                Student oversight module is under development. You will be able to view enrollment, attendance, and performance metrics here.
            </p>
        </div>
    </div>
);

export default Students;
