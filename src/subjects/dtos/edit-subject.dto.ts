import { IsNotEmpty, IsOptional } from "class-validator";

export class EditSubjectDto{
    @IsOptional()
    name?: string;
    
    @IsOptional()
    professor?: string;

    @IsOptional()
    color?: string; 
}