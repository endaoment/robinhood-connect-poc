import { validate, ValidationError } from "class-validator";
import { plainToClass, ClassConstructor } from "class-transformer";

/**
 * Validation result
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Validate and transform plain object to DTO instance
 *
 * @param dtoClass - The DTO class to validate against
 * @param plainObject - Plain object to validate
 * @returns Validation result with transformed instance or errors
 *
 * @example
 * ```typescript
 * const result = await validateDto(GenerateUrlDto, requestBody);
 * if (!result.success) {
 *   throw new Error(result.errors.join(', '));
 * }
 * const dto = result.data;
 * ```
 */
export async function validateDto<T extends object>(
  dtoClass: ClassConstructor<T>,
  plainObject: any
): Promise<ValidationResult<T>> {
  // Transform plain object to class instance
  const dtoInstance = plainToClass(dtoClass, plainObject);

  // Validate
  const errors: ValidationError[] = await validate(dtoInstance);

  if (errors.length > 0) {
    // Extract error messages
    const errorMessages = errors.flatMap((error) =>
      error.constraints ? Object.values(error.constraints) : []
    );

    return {
      success: false,
      errors: errorMessages,
    };
  }

  return {
    success: true,
    data: dtoInstance,
  };
}

/**
 * Validate DTO or throw error
 *
 * @param dtoClass - The DTO class to validate against
 * @param plainObject - Plain object to validate
 * @returns Validated DTO instance
 * @throws {Error} If validation fails
 */
export async function validateDtoOrThrow<T extends object>(
  dtoClass: ClassConstructor<T>,
  plainObject: any
): Promise<T> {
  const result = await validateDto(dtoClass, plainObject);

  if (!result.success) {
    throw new Error(`Validation failed: ${result.errors?.join(", ")}`);
  }

  return result.data!;
}

